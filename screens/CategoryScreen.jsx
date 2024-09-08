import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, ScrollView, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SafeAreaView } from "react-native-safe-area-context";


const apiKeys = [
  '0db6ee2512msh7a4ac6954790325p19322fjsne9c98a9ad7da', // Replace with your actual RapidAPI keys
];

const CACHE_EXPIRATION_DAYS = 30;
const CACHE_KEY_PREFIX = 'businesses_';

const CategoryScreen = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();

  const { category } = route.params;

  useEffect(() => {
    const fetchLocationAndBusinesses = async () => {
      // Request location permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to fetch businesses.');
        setLoading(false);
        return;
      }

      // Get the current location
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords);

      // Check if we have cached data for the selected category
      const cachedData = await getCachedData(category);
      if (cachedData) {
        setBusinesses(cachedData);
        setLoading(false);
        return;
      }

      // Function to fetch businesses with a given API key and a timeout
      const fetchWithApiKey = async (apiKey) => {
        try {
          // Create a promise that rejects after 2 seconds
          const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timed out')), 2000)
          );

          // Race between the API call and the timeout
          const response = await Promise.race([
            axios.get(
              'https://local-business-data.p.rapidapi.com/search-nearby',
              {
                params: {
                  query: category,
                  lat: location.coords.latitude,
                  lng: location.coords.longitude,
                  limit: 1,
                  language: 'en',
                  region: 'us',
                  extract_emails_and_contacts: false,
                },
                headers: {
                  'X-RapidAPI-Host': 'local-business-data.p.rapidapi.com',
                  'X-RapidAPI-Key': apiKey,
                },
              }
            ),
            timeout
          ]);

          // Cache the result and return success
          await cacheData(category, response.data.data);
          setBusinesses(response.data.data);
          setLoading(false);
          return true; // API key worked
        } catch (err) {
          if (err.response && err.response.status === 403) {
            return false; // API key failed
          } else if (err.message === 'Request timed out') {
            return false; // Request timed out
          } else {
            throw err; // Other errors
          }
        }
      };

      // Try each API key until one works
      for (const apiKey of apiKeys) {
        const success = await fetchWithApiKey(apiKey);
        if (success) break;
      }

      setLoading(false);
    };

    fetchLocationAndBusinesses();
  }, [category]);

  const getCachedData = async (category) => {
    const cacheKey = `${CACHE_KEY_PREFIX}${category}`;
    const cachedItem = await AsyncStorage.getItem(cacheKey);
    if (cachedItem) {
      const { timestamp, data } = JSON.parse(cachedItem);
      const now = new Date();
      const cacheAgeDays = (now - new Date(timestamp)) / (1000 * 60 * 60 * 24);
      if (cacheAgeDays <= CACHE_EXPIRATION_DAYS) {
        return data;
      } else {
        await AsyncStorage.removeItem(cacheKey); // Remove expired cache
      }
    }
    return null;
  };

  const cacheData = async (category, data) => {
    const cacheKey = `${CACHE_KEY_PREFIX}${category}`;
    const timestamp = new Date().toISOString();
    const cachedItem = JSON.stringify({ timestamp, data });
    await AsyncStorage.setItem(cacheKey, cachedItem);
  };

  const handleItemPress = (business) => {
    navigation.navigate('BusinessDetails', { business });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error loading data</Text>
      </View>
    );
  }
  const renderRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const totalStars = 5;

    return (
      <View style={styles.ratingContainer}>
        {Array.from({ length: totalStars }, (_, index) => {
          if (index < fullStars) {
            return <Icon key={index} name="star" size={16} color="#f5f11b" style={styles.star} />;
          }
          if (index === fullStars && hasHalfStar) {
            return <Icon key={index} name="star-half-o" size={16} color="#f5f11b" style={styles.star} />;
          }
          return <Icon key={index} name="star" size={16} color="gray" style={styles.star} />;
        })}
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>{category}s in your area!</Text>
        {businesses.map((item, index) => (
          <TouchableOpacity key={index} style={styles.itemContainer} onPress={() => handleItemPress(item)}>
            <Image
              source={{ uri: item.photos_sample[0]?.photo_url }}
              style={styles.image}
            />
            <View style={styles.textContainer}>
              <Text style={styles.businessName}>{item.name}</Text>
              <Text style={styles.businessDetails}>{item.address}</Text>
              <Text style={styles.businessDetails}>{item.phone_number}</Text>
              {renderRatingStars(item.rating)}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Optional: Set background color if needed
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  textContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  businessName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  businessDetails: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  star: {
    marginRight: 2, // Space between stars
  },
  ratingText: {
    fontSize: 14,
    color: '#000',
    marginLeft: 8,
  },
});

export default CategoryScreen;
