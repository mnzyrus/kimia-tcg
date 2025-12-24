import { CalculationData } from "@/types";

type PHAnimationListener = (data: CalculationData) => void;

let listeners: PHAnimationListener[] = [];

export function subscribeToPHAnimation(listener: PHAnimationListener) {
    listeners.push(listener);
    return () => {
        listeners = listeners.filter(l => l !== listener);
    };
}

export function triggerPHAnimation(data: CalculationData) {
    listeners.forEach(l => l(data));
}
