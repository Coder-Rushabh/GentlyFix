import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const BusinessDetails = ({ route }) => {
  const { business } = route.params;

  // Function to open links
  const openLink = (url) => {
    Linking.openURL(url).catch(err => console.error("Failed to open URL:", err));
  };

   // Function to handle phone call
   const handleCall = () => {
    const formattedNumber = business.phone_number.replace(/[^0-9]/g, ''); // Remove non-numeric characters
    if (formattedNumber.length > 0) {
      const url = `tel:${formattedNumber}`;
      Linking.openURL(url).catch(err => console.error("Failed to make a call:", err));
    } else {
      console.error("Invalid phone number");
    }
  };
  // Function to handle messaging
  const handleMessage = () => {
    const formattedNumber = business.phone_number.replace(/\D/g, ''); // Remove non-numeric characters
    const url = `sms:${formattedNumber}`;
    Linking.openURL(url).catch(err => console.error("Failed to send a message:", err));
  };

  // Generate star rating
  const renderRatingStars = (rating) => {
    const totalStars = 5;
    const filledStars = Math.round(rating);
    const stars = Array.from({ length: totalStars }, (_, index) => (
      <Icon
        key={index}
        name={index < filledStars ? 'star' : 'star-o'}
        size={20}
        color={index < filledStars ? '#FFD700' : '#d3d3d3'}
      />
    ));
    return <View style={styles.ratingContainer}>{stars}</View>;
  };

  // Map subtype to description
  const subtypeDescriptions = [
    "Blast cleaning service",
    "Industrial equipment supplier",
    "Metal fabricator",
  ];

  // Render business hours
  const renderBusinessHours = (hours) => {
    return hours.map((hour, index) => (
      <Text key={index} style={styles.detail}>{hour.day}: {hour.time}</Text>
    ));
  };

  // Render social media links
  const renderSocialMediaLinks = (socialMedia) => {
    return socialMedia.map((link, index) => (
      <TouchableOpacity key={index} onPress={() => openLink(link.url)}>
        <Text style={styles.link}>{link.platform}</Text>
      </TouchableOpacity>
    ));
  };

  // Render reviews
  const renderReviews = (reviews) => {
    return reviews.map((review, index) => (
      <View key={index} style={styles.review}>
        <Text style={styles.reviewText}>{review.summary}</Text>
        <Text style={styles.reviewRating}>Rating: {review.details.rating}</Text>
      </View>
    ));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Image Container with Gradient */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: business.photos_sample[0]?.photo_url }}
            style={styles.image}
          />
          <LinearGradient
            colors={['transparent', 'black']}
            style={styles.gradientOverlay}
          />
          
          {/* Rating Stars */}
          <View style={styles.ratingWrapper}>
            {renderRatingStars(business.rating)}
          </View>
          
          {/* Verified Mark */}
          
        </View>

        {/* Business Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.header}>{business.name}</Text>
          <Text style={styles.detail}>{business.type}</Text>
          <Text style={styles.detail}>{subtypeDescriptions[business.subtype]}</Text>
          <Text style={styles.detail}>{typeof business.about === 'string' ? business.about : ''}</Text>

          <Text style={styles.detail}>{business.address}</Text>
          <Text style={styles.detail}>{business.phone_number}</Text>
          {business.website && (
            <TouchableOpacity onPress={() => openLink(business.website)}>
              <Text style={styles.link}>{business.website}</Text>
            </TouchableOpacity>
          )}
          {/* Links in Row */}
          <View style={styles.linksRow}>
            {business.place_link && (
              <TouchableOpacity onPress={() => openLink(business.place_link)}>
                <Text style={styles.link}>View on Google Maps</Text>
              </TouchableOpacity>
            )}
            {business.owner_link && (
              <TouchableOpacity onPress={() => openLink(business.owner_link)}>
                <Text style={styles.link}>Owner Profile</Text>
              </TouchableOpacity>
            )}
          </View>
          

          {/* Business Hours */}
          {business.hours && (
            <View style={styles.hoursContainer}>
              <Text style={styles.header}>Business Hours:</Text>
              {renderBusinessHours(business.hours)}
            </View>
          )}

          {/* Social Media Links */}
          {business.socialMedia && (
            <View style={styles.socialMediaContainer}>
              <Text style={styles.header}>Follow Us:</Text>
              {renderSocialMediaLinks(business.socialMedia)}
            </View>
          )}

          {/* Reviews */}
          {business.reviews && business.reviews.length > 0 && (
            <View style={styles.reviewsContainer}>
              <Text style={styles.reviewsHeader}>Recent Reviews:</Text>
              {renderReviews(business.reviews)}
            </View>
          )}
        </View>

         {/* Call and Message Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleCall}>
          <Text style={styles.buttonText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleMessage}>
          <Text style={styles.buttonText}>Message</Text>
        </TouchableOpacity>
      </View>


      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 8,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%', // Adjust height as needed
    borderRadius: 8,
  },
  ratingWrapper: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedWrapper: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsContainer: {
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detail: {
    fontSize: 16,
    marginBottom: 4,
  },
  link: {
    fontSize: 16,
    color: '#007BFF',
    marginRight: 16,
  },
  linksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  verifiedText: {
    fontSize: 16,
    color: 'green',
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewsContainer: {
    marginTop: 16,
  },
  reviewsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  review: {
    marginBottom: 12,
  },
  reviewText: {
    fontSize: 16,
  },
  reviewRating: {
    fontSize: 14,
    color: '#FFD700',
    marginTop: 4,
  },
  hoursContainer: {
    marginTop: 16,
  },
  socialMediaContainer: {
    marginTop: 16,
  },
});

export default BusinessDetails;
