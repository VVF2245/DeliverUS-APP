import { useEffect, useState } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemiBold'

export default function OrderDetailScreen({ navigation, route }) {
  useEffect(() => {}, [route])

  const [order, setOrder] = useState({
    createdAt: new Date()
  })

  const renderHeader = () => {
    return (
      <View style={styles.headerContainer}>
        <TextSemiBold textStyle={styles.textTitle}>
          Order #{order.id}
        </TextSemiBold>

        <TextRegular textStyle={styles.text}>
          {new Date(order.createdAt).toLocaleString()}
        </TextRegular>

        <TextRegular textStyle={styles.text}>
          {new Date(order.createdAt).toLocaleString()}
        </TextRegular>

        <TextRegular textStyle={styles.text}>
          {new Date(order.createdAt).toLocaleString()}
        </TextRegular>

        <TextRegular textStyle={styles.text}>
          {new Date(order.createdAt).toLocaleString()}
        </TextRegular>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList style={styles.container} ListHeaderComponent={renderHeader} />
    </View>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    justifyContent: 'center',
    alignItems: 'left',
    margin: 50
  },
  textTitle: {
    fontSize: 20,
    color: 'white'
  },
  text: {
    fontSize: 16,
    color: 'white',
    alignSelf: 'center',
    marginLeft: 5
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 50
  }
})
