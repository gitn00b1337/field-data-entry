import {
    View,
    StyleSheet,
    GestureResponderEvent,
} from 'react-native';
import React, { useState } from 'react';
import {
    Title,
    Paragraph,
    Menu,
    IconButton,
    Divider,    
} from 'react-native-paper';

export type DotsPopupMenuAction = {
    label: string;
    onPress: () => void;
    key: string;
    hasDivider?: boolean;
}

export type DotsPopupMenuProps = {
    actions: DotsPopupMenuAction[];
    size?: number;
    iconColor?: string;
}

export const DotsPopupMenu = ({
    actions,
    size = 24,
    iconColor = 'gray',
}: DotsPopupMenuProps) => {
    const [showMenu, setShowMenu] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 })
    const openMenu = () => setShowMenu(true);
    const closeMenu = () => setShowMenu(false);

    const onIconPress = (event: GestureResponderEvent) => {
        const { nativeEvent } = event;
        const anchor = {
            x: nativeEvent.pageX,
            y: nativeEvent.pageY,
        };

        setMenuAnchor(anchor);
        openMenu();
    }

    return (
        <View style={styles.container}>
            <IconButton 
                icon='dots-vertical'
                size={size}
                iconColor={iconColor}
                style={styles.menuIcon}
                onPress={onIconPress}
            />
            <Menu
                visible={showMenu}
                onDismiss={closeMenu}
                anchor={menuAnchor}
                contentStyle={styles.contentStyle}
            >
                {
                    actions.map(({ label, onPress, key, hasDivider }) => 
                        <View key={key}>
                            <Menu.Item onPress={onPress} title={label} />
                            {
                                hasDivider && <Divider style={styles.divider} />
                            }
                        </View>
                    )
                }
            </Menu>
        </View>
    )
};

const styles = StyleSheet.create({
    divider: {
        marginVertical: 6,
    },
    icon: {
        color: '#fff',
        // width: 45,
        textAlign: 'center',
        flexGrow: 0,
    },
    menuIcon: {    
        marginTop: 0,
        marginBottom: 0,
        paddingTop: 0,
        paddingBottom: 0,    
        marginRight: 0,
        paddingRight: 0,
    },
    container: {
    },
    contentStyle: {
        backgroundColor: 'white',
    }
});