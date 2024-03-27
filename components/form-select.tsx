import { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Text, } from "react-native";
import { Dropdown, } from 'react-native-element-dropdown';
import { MD3Theme, useTheme } from "react-native-paper";
import { deferredEffect } from "../lib/effect";
import { FormEntryV2 } from "../lib/config";
import { Control, Controller, Path, useController, useWatch } from "react-hook-form";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export type FormSelectProps = {
  fieldName: string;
  label: string;
  options: {
    label: string;
    value: string;
  }[];
  onFocus?: () => void;
  onChange?: (val: string) => void;
  isDisabled?: boolean;
  control: Control<FormEntryV2, any>;
  defaultValue?: string;
}

export function FormSelectField({
  fieldName,
  label,
  options,
  onFocus,
  onChange,
  control,
}: FormSelectProps) {
  const [isFocus, setIsFocus] = useState(false);
  const val = useWatch({
    control,
    name: fieldName as Path<FormEntryV2>,
  });
  // const labelFontSize = useSharedValue(`${val}`.length ? 12 : 16);
  // const translateY = useSharedValue(0);
  // const translateX = useSharedValue('0');

  const theme = useTheme();
  const styles = makeStyles(theme);

  const hasVal = (Array.isArray(val) || typeof val === 'string') && val.length > 0;

  useEffect(() => {
    if (isFocus && onFocus) {
      onFocus();
    }
  }, [isFocus]);

  deferredEffect(() => {
    if (typeof onChange === 'function') {
      onChange(val as string);
    }
  }, [val]);

  const animationDuration = 200;

  const labelStyles = useAnimatedStyle(() => {
    if (typeof val === 'string' && val.length > 0) {
      // if has a value, position top left
      return {
        top: withTiming(0, { duration: animationDuration }),
        left: withTiming(16, { duration: animationDuration }),
      }
    } 

    return {
      top: withTiming(8, { duration: animationDuration }),
      left: withTiming(16, { duration: animationDuration }),
    }
  }, [ val ]);

  const labelTextStyles = useAnimatedStyle(() => {
    if (typeof val === 'string' && val.length > 0) {
      return { 
        fontSize: withTiming(12, { duration: animationDuration }),
      }
    }

    return { 
      fontSize: withTiming(16, { duration: animationDuration }),
    }
  }, [ val ]);

  return (
    <View style={styles.border}>
        <View style={{ flexGrow: 1, }} />
        <View style={styles.container}>
            <Animated.View style={[{
                width: '100%',
                position: 'absolute',
                zIndex: -100
            }, labelStyles ]}>
                <Animated.Text
                    style={labelTextStyles}
                >
                    {label || 'New Field'}
                </Animated.Text>
            </Animated.View>   
                <View style={{ width: '100%' }}>  
            <Controller
              key={`field-${fieldName}`}
              control={control}
              name={fieldName as Path<FormEntryV2>}
              render={({ field, }) => (
                <Dropdown
                  style={[styles.dropdown, isFocus && { borderColor: theme.colors.primary }]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  containerStyle={styles.dropdownContainer}
                  iconStyle={styles.iconStyle}
                  data={options}
                  search
                  maxHeight={300}
                  labelField={'label'}
                  valueField={'value'}
                  placeholder={''}
                  searchPlaceholder="Search..."
                  itemContainerStyle={{ marginLeft: 0, paddingLeft: 0, left: 0 }}
                  value={field.value?.toString()}
                  onFocus={() => setIsFocus(true)}
                  onBlur={() => setIsFocus(false)}
                  onChange={item => {
                    field.onChange(item.value);
                    setIsFocus(false);
                  }}
                />
              )}
            />
            </View>
            </View>
    </View>
  )
}

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
  border: {
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
    flexGrow: 1,
    marginBottom: 10,
    flexDirection: 'column',
  },
  container: {
      backgroundColor: 'white',
      justifyContent: 'flex-end',
      flexDirection: 'row',
      position: 'relative',
      
  },
  dropdownContainer: {
      paddingTop: 0,
      paddingBottom: 0,
  },
  dropdown: {
      marginBottom: 0,
      paddingBottom: 0,
      paddingTop: 10,
      paddingHorizontal: 4,
  },
  icon: {
      marginRight: 5,
  },
  placeholderStyle: {
      fontSize: 16,
      paddingLeft: 16,
  },
  selectedTextStyle: {
      fontSize: 16,
      color: theme.colors.onSurface,
      paddingLeft: 12,
  },
  iconStyle: {
      width: 20,
      height: 20,
  },
  inputSearchStyle: {
      fontSize: 16,
      borderRadius: 2,
  },
});