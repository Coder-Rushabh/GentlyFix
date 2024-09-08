import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Dimensions, TextInput, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from "react-native-safe-area-context";



const categories = [
  { id: '1', name: 'Plumber', image: require('../assets/category/plumber.png') },
  { id: '2', name: 'Electrician', image: require('../assets/category/electrician.png') },
  { id: '3', name: 'Welder', image: require('../assets/category/welder.png') },
  { id: '4', name: 'Painter', image: require('../assets/category/painter.png') },
  { id: '5', name: 'Builder', image: require('../assets/category/wall.png') },
  { id: '6', name: 'Guard', image: require('../assets/category/guard.png') },
  { id: '7', name: 'Gardener', image: require('../assets/category/horticulturist.png') },
  { id: '8', name: 'Pest Control', image: require('../assets/category/insecticide.png') },
  { id: '9', name: 'Locksmith', image: require('../assets/category/locksmith.png') },
  { id: '10', name: 'Roofer', image: require('../assets/category/roofer.png') },
  { id: '11', name: 'IT technician', image: require('../assets/category/technician.png') },
  { id: '12', name: 'Car Penter', image: require('../assets/category/tools.png') },

  { id: '13', name: 'Hardware', image: require('../assets/category/hand-tools.png') },
  { id: '14', name: 'AC Repairer', image: require('../assets/category/air-conditioner.png') },
  { id: '15', name: 'Fridge Repairer', image: require('../assets/category/fridge.png') },
  { id: '16', name: 'Cleaner', image: require('../assets/category/vacum-cleaner.png') },

  { id: '17', name: 'Car Repairer', image: require('../assets/category/car.png') },
  { id: '18', name: 'Bike Repairer', image: require('../assets/category/motorcycle.png') },
  { id: '19', name: 'Big Vehicle Repairer', image: require('../assets/category/delivery.png') },
  { id: '20', name: 'Gadgets Repairer', image: require('../assets/category/camera-drone.png') },

  { id: '21', name: 'CCTV installation', image: require('../assets/category/cctv-camera.png') },
  { id: '22', name: 'Mobile Repairer', image: require('../assets/category/mobile-app.png') },
  { id: '23', name: 'TV Repairer', image: require('../assets/category/smart-tv.png') },
  { id: '24', name: 'Solar', image: require('../assets/category/solar-panel.png') },

  { id: '25', name: 'Pool Maintenance', image: require('../assets/category/pool-maintenance.png') },
  { id: '26', name: 'Home renovation', image: require('../assets/category/renovation.png') },
  { id: '27', name: 'Decoration', image: require('../assets/category/wedding-arch.png') },
  { id: '28', name: 'Washing machine Repairer', image: require('../assets/category/laundry-machine.png') },
  // Add more categories with image paths as needed
];

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen() {
  const { width: screenWidth } = Dimensions.get('window'); // Get screen width


  const navigation = useNavigation();
  const [numColumns, setNumColumns] = useState(4);
  const [searchText, setSearchText] = useState('');

  const padding = 10;
  const totalPadding = padding * (numColumns - 1);
  const columnWidth = (screenWidth - totalPadding) / numColumns;

  const generateKey = (item, numColumns) => {
    return `${item.id}-${numColumns}`;
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={{
        width: columnWidth,
        alignItems: 'center',
        marginBottom: 20,
      }}
      onPress={() => navigation.navigate('Category', { category: item.name })}
    >
      <Image
        source={item.image}
        style={{
          width: '50%',
          height: columnWidth - 40,
          resizeMode: 'contain',
        }}
      />
      <Text style={{ fontSize: 13, marginTop: 5 }}>{item.name}</Text>
    </TouchableOpacity>
  );

  const handleSearch = () => {
    navigation.navigate('Category', { category: searchText });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ flex: 1, padding: 20 }}>
        {/* App Title Image */}
        <View style={styles.titleContainer}>
          <Image source={require('../assets/1.png')} style={styles.titleImage} />
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search categories..."
            value={searchText}
            onChangeText={setSearchText}
            style={styles.searchBar}
            onSubmitEditing={() => handleSearch(searchText)} // Pass searchText on submit
          />
          <TouchableOpacity style={styles.searchButton} onPress={() => handleSearch(searchText)}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={categories}
          keyExtractor={(item) => generateKey(item, numColumns)}
          renderItem={renderItem}
          numColumns={numColumns}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    alignItems: 'center', 
    marginBottom: 10// Center the image horizontally
  },
  titleImage: {
    width: screenWidth * 0.8, // 80% of the screen width
    height: 50, // Fixed height, adjust as needed
    resizeMode: 'contain', // Maintain aspect ratio
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20, // Space below search bar
  },
  searchBar: {
    flex: 1,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    height: 40, // Set height for the input box
  },
  searchButton: {
    backgroundColor: '#007BFF', // Blue color for the button
    paddingHorizontal: 16,
    borderRadius: 5,
    marginLeft: 10,
    height: 40, // Match the height of the input box
    justifyContent: 'center', // Center text vertically
    alignItems: 'center', // Center text horizontally
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});