import AsyncStorage from '@react-native-async-storage/async-storage';
import { FormConfig } from './config';
import { generateUUID } from './utils';
import Constants from "expo-constants";
import { Platform } from 'react-native';

export const dbActions = {
    test(p1: string, p2: number) {
        console.log(p1 + ' ' + p2)
    }
}
