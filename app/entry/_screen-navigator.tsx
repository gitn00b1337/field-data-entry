import { StyleSheet, View } from "react-native";
import { FormEntryV2 } from "../../lib/config";
import { MD3Theme, Text, useTheme } from "react-native-paper";
import { TouchableOpacity } from "react-native-gesture-handler";

type ScreenNavigatorProps = {
    form: FormEntryV2;
    screenIndex: number;
    setScreenIndex: (index: number) => void;
}

export function ScreenNavigator({
    form,
    screenIndex,
    setScreenIndex,
}: ScreenNavigatorProps) {
    const theme = useTheme();
    const styles = makeStyles(theme);

    return (
        <View style={styles.container}>
            <View style={styles.positioner}>
                {
                    form.config.screens.map((screen, index) => {
                        const isActive = index === screenIndex;

                        return (
                            <TouchableOpacity 
                                key={`screennav-${index}`}
                                onPress={() => setScreenIndex(index)}
                                style={[
                                    styles.navItem,
                                    isActive && styles.activeNavItem
                                ]}
                            >
                                <View >
                                    <Text style={styles.navLabel}>{`${index+1}` }</Text>
                                </View>
                            </TouchableOpacity>
                        )
                    })
                }
                <View style={styles.line} />
            </View>
        </View>
    )
}

const SPACING = 24;

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
    },
    positioner: {
        flexDirection: 'row',
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
    line: {
        position: 'absolute',
        top: SPACING,
        height: 2,
        left: SPACING + 2,
        right: SPACING + 2,
        zIndex: -1,
        backgroundColor: theme.colors.secondary,
    },
    navItem: {
        backgroundColor: theme.colors.secondary,
        color: theme.colors.onPrimary,
        borderRadius: 25,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        marginHorizontal: SPACING,
    },
    activeNavItem: {
        backgroundColor: theme.colors.primary,
    },
    navLabel: {
        color: theme.colors.onPrimary,
        textAlign: 'center',
        verticalAlign: 'middle',
        fontWeight: '700',
    }
})