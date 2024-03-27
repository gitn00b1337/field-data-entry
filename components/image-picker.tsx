import { useState } from "react";
import * as ExpoImagePicker from 'expo-image-picker';
import { Button, useTheme } from "react-native-paper";
import { Text, View, Image, ViewProps, StyleProp, ViewStyle, TouchableOpacity, StyleSheet } from "react-native";

export type ImagePickerProps = {
    label?: string
    dimensions?: {
        width: number
        height: number
    }
    aspect?: [number, number]
} & ViewProps;

export function ImagePicker({
    label = 'Select Image',
    dimensions = {
        width: 150,
        height: 150,
    },
    aspect = [1, 1],
    ...props
}: ImagePickerProps) {
    const [image, setImage] = useState(null);
    const theme = useTheme();

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ExpoImagePicker.launchImageLibraryAsync({
            mediaTypes: ExpoImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect,
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const style: StyleProp<ViewStyle> = {
        width: dimensions.width,
        height: dimensions.height,
        backgroundColor: '#fff',
        overflow: 'hidden',
        display: 'flex',
    }

    return (
        <View
            style={{
                borderRadius: theme.roundness,
                borderWidth: 2,
                borderStyle: 'solid',
                borderColor: theme.colors.outline,
            }}
        >            
        {
                    image && (
                        <>
                            <View style={styles.labelContainer}>
                                <View style={styles.labelBg} />
                                <Text style={styles.label}>Form Image</Text>
                            </View>
                        </>
                    )
                }
            <TouchableOpacity onPress={pickImage} style={{ position: 'relative', display: 'flex', }}>                
                <View
                    {...props}
                    style={style}
                >
                    {
                        image && (
                            <Image
                                source={{ uri: image }}
                                width={dimensions.width}
                                height={dimensions.height}
                                resizeMode='contain'
                            />
                        )
                    }
                    {
                        !image && (
                            <Text style={{
                                fontWeight: '400',
                                color: theme.colors.onSurface,
                                fontSize: 16,
                            }}>
                                {label}
                            </Text>
                        )
                    }
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    labelContainer: {
        position: 'absolute',
        top: -10,
        left: 10,
        backgroundColor: 'transparent',
        zIndex: 100,
        overflow: 'hidden',
    },
    labelBg: {
        width: '100%',
        position: 'absolute',
        top: 10,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        zIndex: 110,
        height: '100%',
    },
    label: {
        fontSize: 12,
        paddingHorizontal: 6,
        zIndex: 120,
        letterSpacing: 0.2
    },
})