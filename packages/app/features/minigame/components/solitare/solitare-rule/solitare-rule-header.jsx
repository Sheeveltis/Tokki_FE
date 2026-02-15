import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import { useRouter } from 'solito/navigation'
import { NavigationPill } from 'components/navigation-pill'

import GameCardIcon from '../../../../../../assets/icon/icon-mainflow/game-card.svg'
import ArrowIcon from '../../../../../../assets/icon/icon-mainflow/arrow.svg'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

export function SolitareRuleHeader() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.backButtonWrapper}>
          <NavigationPill
            label="Quay lại"
            icon={ArrowIcon}
            onPress={() => router.back()}
            style={styles.backPill}
            textStyle={styles.backPillText}
            iconStyle={styles.backPillIcon}
          />
        </View>

        <View style={styles.centerSection}>
          <View style={styles.iconCircle}>
            <Image source={normalizeImageSource(GameCardIcon)} style={styles.icon} resizeMode="contain" />
          </View>
          <Text style={styles.title}>Solitaire</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 24,
    height: '10vh',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  backButtonWrapper: {
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingRight: 100,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  icon: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  backPill: {
    backgroundColor: '#FFFFFF',
  },
  backPillText: {
    fontWeight: '700',
  },
  backPillIcon: {
    transform: [{ scaleX: -1 }],
  },
})

export default SolitareRuleHeader


