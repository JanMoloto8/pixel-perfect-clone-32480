import * as tf from "@tensorflow/tfjs";
import { State } from "./Game";

export class NeuralNetwork {
    public model: tf.Sequential;

    constructor() {
        this.model = tf.sequential();

        this.model.add(
            tf.layers.dense({
                inputShape: [54],
                units: 64,
                activation: "relu",
                kernelInitializer: "glorotNormal",
                biasInitializer: "zeros",
            }),
        );

        this.model.add(
            tf.layers.dense({
                units: 64,
                activation: "relu",
                kernelInitializer: "glorotNormal",
                biasInitializer: "zeros",
            }),
        );

        this.model.add(
            tf.layers.dense({
                units: 1,
                activation: "linear",
                kernelInitializer: "glorotNormal",
                biasInitializer: "zeros",
            }),
        );

    }

    public saveToLocalStorage(key: string): void {
        if (typeof localStorage === "undefined") return;

        try {
            const weights = this.model.getWeights().map((weight) => ({
                shape: weight.shape,
                values: Array.from(weight.dataSync()),
            }));

            localStorage.setItem(key, JSON.stringify(weights));
        } catch {}
    }

    public loadFromLocalStorage(key: string): boolean {
        if (typeof localStorage === "undefined") return false;

        const serializedWeights = localStorage.getItem(key);
   
        if (!serializedWeights) return false;

        try {
            const weights = JSON.parse(serializedWeights) as {
                shape: number[];
                values: number[];
            }[];

            if (weights.length !== this.model.getWeights().length) return false;

            const tensors = weights.map(({ shape, values }) => tf.tensor(values, shape));
            this.model.setWeights(tensors);
     
            return true;
        } catch {
            return false;
        }
    }

    public predict(state: State): number {
        const stateArray: number[] = [
            ...state.B0,
            ...state.B1,
            state.B0Remaining,
            state.B1Remaining,
            state.phase.x,
            state.phase.y,
            state.phase.z,
            state.Player,
        ];

        const input = tf.tensor2d([stateArray]);


        const output = this.model.predict(input) as tf.Tensor;

        const value = output.dataSync()[0];

        input.dispose();
        output.dispose();

        return value;
    }

        public printChangedWeights(oldWeights: number[]) {
        const newWeights = this.model.getWeights();

        let index = 0;

        for (let i = 0; i < newWeights.length; i++) {
            const values = newWeights[i].dataSync();

            for (let j = 0; j < values.length; j++) {
                const oldValue = oldWeights[index];
                const newValue = values[j];

                if (oldValue !== newValue) {
                    console.log(
                        `Weight ${index + 1}: ${oldValue} -> ${newValue}`
                    );
                }

                index++;
            }
        }
    }

    public getWeightsAsArray(): number[] {
        const weights = this.model.getWeights();

        const allWeights: number[] = [];

        for (let i = 0; i < weights.length; i++) {
            const values = weights[i].dataSync();

            for (let j = 0; j < values.length; j++) {
                allWeights.push(values[j]);
            }
        }

        return allWeights;
    }

    public inspectFirstLayer(state: tf.Tensor2D): void {

        const firstLayer = this.model.layers[0];

        const activationModel = tf.model({
            inputs: this.model.inputs,
            outputs: firstLayer.output as tf.SymbolicTensor,
        });

        const output = activationModel.predict(state) as tf.Tensor;

        const values = Array.from(output.dataSync());

        let zeroCount = 0;
        let positiveCount = 0;

        for (const value of values) {
            if (value === 0) {
                zeroCount++;
            } else if (value > 0) {
                positiveCount++;
            }
        }

    }

   public tdZeroUpdate(
    state: State,
    nextState: State,
    reward: number,
    gamma: number,
    alpha: number,
    terminal: boolean,
): number {

    const stateArray: number[] = [
        ...state.B0,
        ...state.B1,
        state.B0Remaining,
        state.B1Remaining,
        state.phase.x,
        state.phase.y,
        state.phase.z,
        state.Player,
    ];

    const nextStateArray: number[] = [
        ...nextState.B0,
        ...nextState.B1,
        nextState.B0Remaining,
        nextState.B1Remaining,
        nextState.phase.x,
        nextState.phase.y,
        nextState.phase.z,
        nextState.Player,
    ];

    const stateTensor = tf.tensor2d([stateArray]);
    const nextStateTensor = tf.tensor2d([nextStateArray]);

    const stateValueTensor =
        this.model.predict(stateTensor) as tf.Tensor;

    const stateValue = stateValueTensor.dataSync()[0];

    let nextValue = 0;

    if (!terminal) {
        const nextValueTensor =
            this.model.predict(nextStateTensor) as tf.Tensor;

        nextValue = nextValueTensor.dataSync()[0];

        nextValueTensor.dispose();
    }

    const tdError =
        reward + gamma * nextValue - stateValue;
    
    const gradients = tf.variableGrads(() => {
        const prediction =
            this.model.predict(stateTensor) as tf.Tensor;

        return prediction.mean();
    });
  
    const weights = this.model.getWeights();

    this.inspectFirstLayer(stateTensor);


    const updatedWeights: tf.Tensor[] = [];

    for (let i = 0; i < weights.length; i++) {

        const weight = weights[i];

        const variable =
            this.model.trainableWeights[i];

        const gradient =
            gradients.grads[variable.name];

        const newWeight =
            weight.add(gradient.mul(alpha * tdError));
        

        updatedWeights.push(newWeight);
    }

    this.model.setWeights(updatedWeights);

    stateTensor.dispose();
    nextStateTensor.dispose();
    stateValueTensor.dispose();
    gradients.value.dispose();

    for (const key in gradients.grads) {
        gradients.grads[key].dispose();
    }


    return tdError;
}
}
