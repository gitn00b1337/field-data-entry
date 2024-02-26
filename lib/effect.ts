import { useEffect, useRef } from "react";

export function deferredEffect(effect: React.EffectCallback, deps?: React.DependencyList) {
    const hasRendered = useRef(false);

    useEffect(() => {
        if (hasRendered.current) {
            effect();
        }

        hasRendered.current = true;
    }, deps);
}