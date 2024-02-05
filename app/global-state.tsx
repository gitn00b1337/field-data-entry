import React, {createContext, useContext, useEffect, useReducer, useState} from 'react';
import { DrawerConfigType } from './template/drawer';

export type GlobalStateAction = (state: GlobalState, payload?: any) => GlobalState;

export type GlobalState = {
    drawerVisible: boolean;
    configType: DrawerConfigType
}

let globalState: GlobalState;
let listeners = [];

const actions = {
    'SET_DRAWER_VISIBLE': ( state, drawerVisible: boolean) => ({ ...state, drawerVisible }),
    'SET_DRAWER_CONFIG_TYPE': (state, configType) => ({ ...state, configType })
};

export type GlobalStateActionKey = keyof typeof actions; 

export const useGlobalState = (): [GlobalState, (actionIdentifier: GlobalStateActionKey, payload?: any) => any] => {
    if (!globalState) {
        throw new Error(`Global state not configured!`);
    }

    const [state, setState] = useState(globalState);

    const dispatch: any = (actionIdentifier: GlobalStateActionKey, payload?: any) => {
        const action = actions[actionIdentifier];

        if (typeof action !== 'function') {
            console.warn(`Action ${action} invalid`);
            return;
        }

        const newState = action(globalState, payload);
        globalState = { ...globalState, ...newState };

        for (const listener of listeners) {
            listener(globalState);
        }
    }
        
    useEffect(() => {
        listeners.push(setState);
        
        return () => {
            listeners = listeners.filter(keepIf => keepIf !== setState);
        }
    }, [ setState ]);

    return [globalState, dispatch];
}

export const configureGlobalState = () => {
    const initialState: GlobalState = {
        drawerVisible: false,
        configType: 'NAV',
    };

    globalState = { 
        ...globalState, 
        ...initialState 
    };
}
