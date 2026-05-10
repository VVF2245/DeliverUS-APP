import React from 'react'
import { Image, Pressable, StyleSheet, View } from 'react-native'
import TextSemiBold from './TextSemiBold'
import * as GlobalStyles from '../styles/GlobalStyles'

// Props: defaultImageUri: {uri: xxx}, imageUri: {uri: xxx}, onPress: () => {}, title: String, badgeText: String, touchable: boolean
// Style props: cardStyle, imageContainerStyle, imageStyle, bodyStyle, titleStyle
export default function ImageCard(props) {
  const renderImageCardBody = props => {
    return (
      <View
        style={(props.isHorizontal && styles.horizontalCard) || styles.card}
      >
        <View>
          <Image style={styles.image} source={props.imageUri} />
        </View>
        <View style={styles.cardBody}>
          <TextSemiBold textStyle={styles.cardTitle}>
            {props.title}
          </TextSemiBold>
          {props.children}
        </View>
      </View>
    )
  }

  return props.onPress ? (
    <Pressable
      onPress={props.onPress}
      style={({ pressed }) => [
        {
          backgroundColor: pressed
            ? GlobalStyles.brandPrimaryTap
            : props.backgroundButtom || GlobalStyles.brandBackground // si no se quiere elegir fondo de color
        },
        styles.wrapperCustom
      ]}
    >
      {renderImageCardBody(props)}
    </Pressable>
  ) : (
    <>{renderImageCardBody(props)}</>
  )
}

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    marginHorizontal: '1%',
    height: 127,
    padding: 2,
    alignItems: 'flex-start',
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 15
  },
  image: {
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    height: 123,
    width: 123
  },
  cardBody: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    flex: 4,
    position: 'relative',
    height: 123
  },
  cardTitle: {
    fontSize: 15
  },
  // solo para tarjetas horizontales
  horizontalCard: {
    marginTop: 20,
    marginHorizontal: '1%',
    height: 127,
    padding: 2,
    alignItems: 'flex-start',
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 15,
    width: 300
  }
})
