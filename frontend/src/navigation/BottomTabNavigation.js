import { View, Platform, Text, StyleSheet } from 'react-native'
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import Home from '../screens/Home'
import Profile from '../screens/Profile'
import Bookings from '../screens/Bookings'
import Favourite from '../screens/Favourite'

const Tab = createBottomTabNavigator()

const TAB_BG = '#1A1A1A'
const ACTIVE = '#e4b722'
const INACTIVE = '#9CA3AF'

const TabItem = ({ focused, iconName, label }) => (
    <View style={styles.iconWrapper}>
        <Ionicons
            name={iconName}
            size={22}
            color={focused ? ACTIVE : INACTIVE}
        />
        <Text
            numberOfLines={1}
            allowFontScaling={false}
            style={[
                styles.label,
                { color: focused ? ACTIVE : INACTIVE },
            ]}
        >
            {label}
        </Text>
    </View>
)

const BottomTabNavigation = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarShowLabel: false,
                headerShown: false,
                tabBarItemStyle: {
                    paddingHorizontal: 4,
                    justifyContent: 'center',
                    alignItems: 'center',
                },
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    left: 0,
                    elevation: 0,
                    height: Platform.OS === 'ios' ? 90 : 72,
                    paddingTop: 12,
                    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
                    backgroundColor: TAB_BG,
                    borderTopWidth: 0,
                    borderTopColor: 'transparent',
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    shadowColor: 'transparent',
                    shadowOpacity: 0,
                },
            }}
        >
            <Tab.Screen
                name="HomeTab"
                component={Home}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabItem
                            focused={focused}
                            iconName={focused ? 'home' : 'home-outline'}
                            label="Home"
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Bookings"
                component={Bookings}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabItem
                            focused={focused}
                            iconName={focused ? 'calendar' : 'calendar-outline'}
                            label="Bookings"
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Favourite"
                component={Favourite}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabItem
                            focused={focused}
                            iconName={focused ? 'heart' : 'heart-outline'}
                            label="Favourite"
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={Profile}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabItem
                            focused={focused}
                            iconName={focused ? 'person' : 'person-outline'}
                            label="Profile"
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    )
}

const styles = StyleSheet.create({
    iconWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 70,
    },
    label: {
        fontSize: 11,
        marginTop: 4,
        textAlign: 'center',
        includeFontPadding: false,
    },
})

export default BottomTabNavigation
