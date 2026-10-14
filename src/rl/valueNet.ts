import * as tf from "@tensorflow/tfjs";
import { FEATURE_SIZE } from "./features";

export type SerializedWeights = { shape: number[]; values: number[] }[];

export type ValueNetConfig = {
    hidden: number[];
    activation: "relu" | "tanh";
    seed?: number;
};

export const DEFAULT_NET_CONFIG: ValueNetConfig = { hidden: [64, 64], activation: "relu" };

export type TDStepInfo = {
    value: number;
    target: number;
    delta: number;
    gradNorm: number;
};

/**
 * Afterstate value network V(x) and its semi-gradient TD(0) update.
 */
export class ValueNet {
    public model: tf.Sequential;
    public readonly config: ValueNetConfig;

    constructor(config: ValueNetConfig = DEFAULT_NET_CONFIG) {
        this.config = config;
        this.model = tf.sequential();
        let seed = config.seed;
        const init = () =>
            tf.initializers.glorotUniform({ seed: seed === undefined ? undefined : seed++ });
        config.hidden.forEach((units, i) => {
            this.model.add(
                tf.layers.dense({
                    ...(i === 0 ? { inputShape: [FEATURE_SIZE] } : {}),
                    units,
                    activation: config.activation,
                    kernelInitializer: init(),
                    // A small positive bias keeps ReLUs alive at the start.
                    biasInitializer: config.activation === "relu" ? tf.initializers.constant({ value: 0.01 }) : "zeros",
                }),
            );
        });
        this.model.add(
            tf.layers.dense({ units: 1, activation: "linear", kernelInitializer: init(), biasInitializer: "zeros" }),
        );
    }

    private variables(): tf.Variable[] {
        return this.model.trainableWeights.map((w) => w.read() as tf.Variable);
    }

    /** Values for `n` feature rows packed into one Float32Array. */
    values(xs: Float32Array, n: number): Float32Array {
        return tf.tidy(() => {
            const rows = xs.length === n * FEATURE_SIZE ? xs : xs.subarray(0, n * FEATURE_SIZE);
            const out = this.model.predict(tf.tensor2d(rows, [n, FEATURE_SIZE])) as tf.Tensor;
            return out.dataSync() as Float32Array;
        }).slice();
    }

    value(x: Float32Array): number {
        return this.values(x, 1)[0];
    }

    /**
     * Semi-gradient TD(0):  w <- w + alpha * (target - V(x)) * grad_w V(x)
     *
     * `target` (r + gamma * V(x'), or just r at the end) is a plain number,
     * so no gradient flows through it - that is what "semi-gradient" means.
     */
    tdStep(x: Float32Array, target: number, alpha: number): TDStepInfo {
        const vars = this.variables();
        return tf.tidy(() => {
            const input = tf.tensor2d(x, [1, FEATURE_SIZE]);
            const { value, grads } = tf.variableGrads(
                () => (this.model.apply(input) as tf.Tensor).sum() as tf.Scalar,
                vars,
            );
            const v = value.dataSync()[0];
            const delta = target - v;
            let sq = tf.scalar(0);
            for (const variable of vars) {
                const g = grads[variable.name];
                sq = sq.add(g.square().sum());
                variable.assign(variable.add(g.mul(alpha * delta)));
            }
            return { value: v, target, delta, gradNorm: Math.sqrt(sq.dataSync()[0]) };
        });
    }

    /** Fraction of hidden units that output exactly 0 for every row (dead ReLUs). */
    deadUnitFraction(xs: Float32Array, n: number): number[] {
        if (this.config.activation !== "relu") return this.config.hidden.map(() => 0);
        return tf.tidy(() => {
            let h: tf.Tensor = tf.tensor2d(xs.subarray(0, n * FEATURE_SIZE), [n, FEATURE_SIZE]);
            const out: number[] = [];
            for (let i = 0; i < this.config.hidden.length; i++) {
                h = this.model.layers[i].apply(h) as tf.Tensor;
                const alive = h.max(0).greater(0).sum().dataSync()[0];
                out.push(1 - alive / this.config.hidden[i]);
            }
            return out;
        });
    }

    weightL2(): number {
        return tf.tidy(() => {
            let s = tf.scalar(0);
            for (const v of this.variables()) s = s.add(v.square().sum());
            return Math.sqrt(s.dataSync()[0]);
        });
    }

    toJSON(): SerializedWeights {
        return this.model.getWeights().map((w) => ({ shape: w.shape, values: Array.from(w.dataSync()) }));
    }

    loadJSON(weights: SerializedWeights): boolean {
        const current = this.model.getWeights();
        if (weights.length !== current.length) return false;
        for (let i = 0; i < weights.length; i++) {
            if (weights[i].shape.join("x") !== current[i].shape.join("x")) return false;
        }
        const tensors = weights.map(({ shape, values }) => tf.tensor(values, shape));
        this.model.setWeights(tensors);
        tensors.forEach((t) => t.dispose());
        return true;
    }

    copyFrom(other: ValueNet): void {
        this.loadJSON(other.toJSON());
    }

    dispose(): void {
        this.model.dispose();
    }
}
