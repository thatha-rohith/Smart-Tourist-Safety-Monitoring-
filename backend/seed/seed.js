require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Tourist = require('../models/Tourist');
const Alert = require('../models/Alert');
const Zone = require('../models/Zone');
const EFIR = require('../models/EFIR');
const Broadcast = require('../models/Broadcast');

const seedData = async () => {
  await connectDB();
  try {
    await User.deleteMany({});
    await Tourist.deleteMany({});
    await Alert.deleteMany({});
    await Zone.deleteMany({});
    await EFIR.deleteMany({});
    await Broadcast.deleteMany({});

    console.log('Cleared existing data...');

    const admin = await User.create({
      name: 'Superintendent Anil Mehta',
      email: 'admin@stsms.gov.in',
      password: 'admin123',
      phone: '+91 9876543210',
      role: 'admin',
      badgeNumber: 'ADM001',
      department: 'Ministry of Tourism & Home Affairs, New Delhi',
    });

    const authority1 = await User.create({
      name: 'Inspector Rajesh Kumar',
      email: 'rajesh@police.gov.in',
      password: 'police123',
      phone: '+91 9876543211',
      role: 'authority',
      badgeNumber: 'DL-POL-1024',
      department: 'Delhi Tourist Safety Division',
    });

    const authority2 = await User.create({
      name: 'Sub-Inspector Priya Sharma',
      email: 'priya@police.gov.in',
      password: 'police123',
      phone: '+91 9876543212',
      role: 'authority',
      badgeNumber: 'UP-POL-2048',
      department: 'Uttar Pradesh Emergency Response Unit',
    });

    console.log('Created admin and authority users...');

    const touristUsers = await User.insertMany([
      { name: 'Arjun Sharma', email: 'arjun.sharma@gmail.com', password: 'tourist123', phone: '+91 9876500101', role: 'tourist' },
      { name: 'Priya Nair', email: 'priya.nair@gmail.com', password: 'tourist123', phone: '+91 9876500102', role: 'tourist' },
      { name: 'Akash Patel', email: 'akash.patel@gmail.com', password: 'tourist123', phone: '+91 9876500103', role: 'tourist' },
      { name: 'Vikram Singh', email: 'vikram.singh@gmail.com', password: 'tourist123', phone: '+91 9876500104', role: 'tourist' },
      { name: 'Rohan Desai', email: 'rohan.desai@gmail.com', password: 'tourist123', phone: '+91 9876500105', role: 'tourist' },
      { name: 'Meera Joshi', email: 'meera.joshi@gmail.com', password: 'tourist123', phone: '+91 9876500106', role: 'tourist' },
      { name: 'Rahul Verma', email: 'rahul.verma@gmail.com', password: 'tourist123', phone: '+91 9876500107', role: 'tourist' },
      { name: 'Kavita Reddy', email: 'kavita.reddy@gmail.com', password: 'tourist123', phone: '+91 9876500108', role: 'tourist' },
    ]);

    for (const user of touristUsers) {
      const u = await User.findById(user._id);
      u.password = 'tourist123';
      await u.save();
    }

    console.log('Created 8 tourist users...');

    const tourists = await Tourist.insertMany([
      {
        user: touristUsers[0]._id,
        touristId: 'TID100001',
        nationality: 'Indian',
        passportNumber: 'P1234567',
        safetyScore: 82,
        safetyStatus: 'Safe',
        currentLocation: { latitude: 28.6139, longitude: 77.209, address: 'Connaught Place, New Delhi, Delhi', lastUpdated: new Date() },
        locationHistory: [
          { latitude: 28.6129, longitude: 77.2295, address: 'India Gate, Rajpath, New Delhi', timestamp: new Date(Date.now() - 3600000) },
          { latitude: 28.6562, longitude: 77.241, address: 'Red Fort, Chandni Chowk, Old Delhi', timestamp: new Date(Date.now() - 7200000) },
        ],
        totalAlerts: 2,
        emergencyContact: '+91 9811000101',
        visitPurpose: 'Heritage Tourism',
      },
      {
        user: touristUsers[1]._id,
        touristId: 'TID100002',
        nationality: 'Indian',
        passportNumber: 'K7654321',
        safetyScore: 65,
        safetyStatus: 'At Risk',
        currentLocation: { latitude: 34.0837, longitude: 77.577, address: 'Leh Main Market, Leh, Ladakh', lastUpdated: new Date() },
        locationHistory: [
          { latitude: 34.1526, longitude: 77.577, address: 'Leh Palace, Leh, Ladakh', timestamp: new Date(Date.now() - 1800000) },
        ],
        totalAlerts: 4,
        emergencyContact: '+91 9811000102',
        visitPurpose: 'Adventure Tourism',
      },
      {
        user: touristUsers[2]._id,
        touristId: 'TID100003',
        nationality: 'Indian',
        safetyScore: 95,
        safetyStatus: 'Safe',
        currentLocation: { latitude: 26.9124, longitude: 75.7873, address: 'Hawa Mahal, Jaipur, Rajasthan', lastUpdated: new Date() },
        locationHistory: [
          { latitude: 26.9855, longitude: 75.8513, address: 'Amer Fort, Jaipur, Rajasthan', timestamp: new Date(Date.now() - 5400000) },
        ],
        totalAlerts: 0,
        emergencyContact: '+91 9811000103',
        visitPurpose: 'Domestic Travel',
      },
      {
        user: touristUsers[3]._id,
        touristId: 'TID100004',
        nationality: 'Indian',
        safetyScore: 45,
        safetyStatus: 'Critical',
        currentLocation: { latitude: 34.5555, longitude: 77.025, address: 'Kargil Border Area, Ladakh', lastUpdated: new Date() },
        locationHistory: [
          { latitude: 34.5539, longitude: 76.1319, address: 'Drass Valley, Kargil, Ladakh', timestamp: new Date(Date.now() - 900000) },
        ],
        totalAlerts: 7,
        emergencyContact: '+91 9811000104',
        visitPurpose: 'Photography & Sightseeing',
      },
      {
        user: touristUsers[4]._id,
        touristId: 'TID100005',
        nationality: 'Indian',
        safetyScore: 78,
        safetyStatus: 'Safe',
        currentLocation: { latitude: 15.2993, longitude: 74.124, address: 'Calangute Beach, North Goa', lastUpdated: new Date() },
        locationHistory: [
          { latitude: 15.5167, longitude: 73.9833, address: 'Panaji, Goa', timestamp: new Date(Date.now() - 10800000) },
        ],
        totalAlerts: 1,
        emergencyContact: '+91 9811000105',
        visitPurpose: 'Beach Tourism',
      },
      {
        user: touristUsers[5]._id,
        touristId: 'TID100006',
        nationality: 'Indian',
        safetyScore: 55,
        safetyStatus: 'Unsafe',
        currentLocation: { latitude: 30.7333, longitude: 79.0667, address: 'Kedarnath Trek Route, Uttarakhand', lastUpdated: new Date() },
        locationHistory: [
          { latitude: 30.7268, longitude: 79.152, address: 'Gaurikund, Rudraprayag, Uttarakhand', timestamp: new Date(Date.now() - 2700000) },
        ],
        totalAlerts: 5,
        emergencyContact: '+91 9811000106',
        visitPurpose: 'Pilgrimage & Trekking',
      },
      {
        user: touristUsers[6]._id,
        touristId: 'TID100007',
        nationality: 'Indian',
        safetyScore: 88,
        safetyStatus: 'Safe',
        currentLocation: { latitude: 13.0827, longitude: 80.2707, address: 'Marina Beach, Chennai, Tamil Nadu', lastUpdated: new Date() },
        locationHistory: [
          { latitude: 12.9716, longitude: 77.5946, address: 'MG Road, Bengaluru, Karnataka', timestamp: new Date(Date.now() - 86400000) },
        ],
        totalAlerts: 1,
        emergencyContact: '+91 9811000107',
        visitPurpose: 'Business & Leisure',
      },
      {
        user: touristUsers[7]._id,
        touristId: 'TID100008',
        nationality: 'Indian',
        safetyScore: 72,
        safetyStatus: 'Safe',
        currentLocation: { latitude: 26.8467, longitude: 80.9462, address: 'Bara Imambara, Lucknow, Uttar Pradesh', lastUpdated: new Date() },
        locationHistory: [
          { latitude: 27.1767, longitude: 78.0081, address: 'Taj Mahal, Agra, Uttar Pradesh', timestamp: new Date(Date.now() - 43200000) },
        ],
        totalAlerts: 2,
        emergencyContact: '+91 9811000108',
        visitPurpose: 'Cultural Tourism',
      },
    ]);

    console.log('Created 8 tourist profiles...');

    const zones = await Zone.insertMany([
      {
        name: 'Kargil Border – No Entry Zone',
        zoneType: 'Restricted',
        location: { latitude: 34.5555, longitude: 77.025, address: 'Kargil Border Zone, Ladakh, Jammu & Kashmir' },
        radius: 2000,
        status: 'Active',
        description: 'Restricted military border area near LOC. Tourist entry strictly prohibited.',
        createdBy: authority1._id,
      },
      {
        name: 'Leh Air Force Station Restricted Zone',
        zoneType: 'Restricted',
        location: { latitude: 34.0837, longitude: 77.577, address: 'Leh Air Force Base Area, Ladakh' },
        radius: 1500,
        status: 'Active',
        description: 'Restricted military zone near Leh air base. Inner Line Permit required.',
        createdBy: authority1._id,
      },
      {
        name: 'Pahalgam Security Restricted Area',
        zoneType: 'Restricted',
        location: { latitude: 33.7311, longitude: 76.5762, address: 'Pahalgam, Anantnag, Jammu & Kashmir' },
        radius: 1000,
        status: 'Active',
        description: 'Area under security restrictions. Valid ID and permit mandatory.',
        createdBy: authority2._id,
      },
      {
        name: 'Kedarnath High Altitude Risk Zone',
        zoneType: 'Risky',
        location: { latitude: 30.7333, longitude: 79.0667, address: 'Kedarnath, Rudraprayag, Uttarakhand' },
        radius: 3000,
        status: 'Active',
        description: 'High altitude pilgrimage zone. Acute mountain sickness and weather risks.',
        createdBy: authority1._id,
      },
      {
        name: 'Western Ghats Monsoon Landslide Zone',
        zoneType: 'Risky',
        location: { latitude: 19.076, longitude: 73.8777, address: 'Lonavala-Khandala, Maharashtra' },
        radius: 5000,
        status: 'Active',
        description: 'Landslide-prone region during monsoon (June–September). Travel advisory active.',
        createdBy: authority2._id,
      },
      {
        name: 'Sundarbans Wildlife Risk Zone',
        zoneType: 'Risky',
        location: { latitude: 21.9497, longitude: 88.924, address: 'Sundarbans National Park, West Bengal' },
        radius: 4000,
        status: 'Active',
        description: 'Wildlife encounter risk in mangrove forests. Guided tours only.',
        createdBy: authority1._id,
      },
      {
        name: 'Connaught Place Safe Tourist Hub',
        zoneType: 'Safe',
        location: { latitude: 28.6139, longitude: 77.209, address: 'Connaught Place, New Delhi, Delhi' },
        radius: 1500,
        status: 'Active',
        description: 'Designated safe tourist hub with 24/7 Delhi Police patrol.',
        createdBy: authority1._id,
      },
      {
        name: 'Calangute Beach Safe Zone',
        zoneType: 'Safe',
        location: { latitude: 15.2993, longitude: 74.124, address: 'Calangute Beach, North Goa' },
        radius: 2000,
        status: 'Active',
        description: 'Monitored safe beach zone with Goa Tourism Police assistance booth.',
        createdBy: authority2._id,
      },
    ]);

    console.log('Created 8 zones...');

    const alerts = await Alert.insertMany([
      {
        tourist: tourists[3]._id,
        alertType: 'SOS alert',
        severity: 'Critical',
        status: 'Pending',
        location: { latitude: 34.5555, longitude: 77.025, address: 'Kargil Border Area, Ladakh' },
        description: 'Tourist Vikram Singh triggered SOS near restricted border area. Immediate response required.',
      },
      {
        tourist: tourists[1]._id,
        alertType: 'Restricted zone alert',
        severity: 'High',
        status: 'Pending',
        location: { latitude: 34.0837, longitude: 77.577, address: 'Leh Main Market, Ladakh' },
        description: 'Tourist Priya Nair entered restricted military zone perimeter near Leh.',
      },
      {
        tourist: tourists[5]._id,
        alertType: 'Emergency alert',
        severity: 'Critical',
        status: 'Pending',
        location: { latitude: 30.7333, longitude: 79.0667, address: 'Kedarnath Trek Route, Uttarakhand' },
        description: 'Pilgrim Meera Joshi reported altitude sickness symptoms at 3500m elevation.',
      },
      {
        tourist: tourists[0]._id,
        alertType: 'Safety alert',
        severity: 'Medium',
        status: 'Resolved',
        location: { latitude: 28.6139, longitude: 77.209, address: 'Connaught Place, New Delhi' },
        description: 'Tourist Arjun Sharma reported lost wallet at Palika Bazaar. Resolved after verification.',
        resolvedBy: authority1._id,
        resolvedAt: new Date(Date.now() - 86400000),
        responseAction: 'Wallet recovered and returned at Connaught Place Police Booth',
      },
      {
        tourist: tourists[4]._id,
        alertType: 'Location-based alert',
        severity: 'Low',
        status: 'Resolved',
        location: { latitude: 15.2993, longitude: 74.124, address: 'Calangute Beach, Goa' },
        description: 'Tourist Rohan Desai briefly moved outside designated safe beach zone.',
        resolvedBy: authority2._id,
        resolvedAt: new Date(Date.now() - 172800000),
        responseAction: 'Guided back to safe zone by Goa Tourism Police',
      },
      {
        tourist: tourists[6]._id,
        alertType: 'Safety alert',
        severity: 'Medium',
        status: 'Pending',
        location: { latitude: 13.0827, longitude: 80.2707, address: 'Marina Beach, Chennai, Tamil Nadu' },
        description: 'Tourist Rahul Verma reported suspicious activity near hotel on Kamarajar Salai.',
      },
      {
        tourist: tourists[7]._id,
        alertType: 'Emergency alert',
        severity: 'High',
        status: 'Pending',
        location: { latitude: 26.8467, longitude: 80.9462, address: 'Bara Imambara, Lucknow, Uttar Pradesh' },
        description: 'Tourist Kavita Reddy reported heat exhaustion during summer sightseeing in Lucknow.',
      },
      {
        tourist: tourists[2]._id,
        alertType: 'Location-based alert',
        severity: 'Low',
        status: 'Resolved',
        location: { latitude: 26.9124, longitude: 75.7873, address: 'Hawa Mahal, Jaipur, Rajasthan' },
        description: 'Routine location check for Akash Patel – confirmed safe via Rajasthan Tourism helpline.',
        resolvedBy: authority1._id,
        resolvedAt: new Date(Date.now() - 259200000),
        responseAction: 'Confirmed safe via phone contact on 1363 helpline',
      },
    ]);

    console.log('Created 8 alerts...');

    await EFIR.insertMany([
      {
        efirNumber: 'EFIR/2025/1001',
        tourist: tourists[3]._id,
        alert: alerts[0]._id,
        incidentType: 'Other',
        severity: 'Critical',
        location: { latitude: 34.5555, longitude: 77.025, address: 'Kargil Border Area, Ladakh, Jammu & Kashmir' },
        incidentDate: new Date(),
        description: 'Tourist Vikram Singh entered restricted border zone near LOC without valid Inner Line Permit.',
        status: 'Pending',
        source: 'Alert System',
        assignedOfficer: authority1._id,
        responseAction: 'E-FIR Generated – Ladakh Police notified',
      },
      {
        efirNumber: 'EFIR/2025/1002',
        tourist: tourists[5]._id,
        alert: alerts[2]._id,
        incidentType: 'Medical Emergency',
        severity: 'High',
        location: { latitude: 30.7333, longitude: 79.0667, address: 'Kedarnath Trek, Rudraprayag, Uttarakhand' },
        incidentDate: new Date(Date.now() - 3600000),
        description: 'Pilgrim Meera Joshi suffered altitude sickness during Kedarnath yatra at 3500m elevation.',
        status: 'Pending',
        source: 'Emergency Alert',
        assignedOfficer: authority2._id,
        responseAction: 'SDRF rescue team dispatched from Rudraprayag',
      },
      {
        efirNumber: 'EFIR/2025/1003',
        tourist: tourists[0]._id,
        incidentType: 'Theft',
        severity: 'Medium',
        location: { latitude: 28.6139, longitude: 77.209, address: 'Connaught Place, New Delhi, Delhi' },
        incidentDate: new Date(Date.now() - 86400000),
        description: 'Tourist Arjun Sharma reported mobile phone and wallet theft at Palika Bazaar, New Delhi.',
        status: 'Verified',
        source: 'Tourist Report',
        assignedOfficer: authority1._id,
        verifiedBy: authority1._id,
        verifiedAt: new Date(Date.now() - 43200000),
        responseAction: 'Case registered at Connaught Place Police Station – under investigation',
      },
      {
        efirNumber: 'EFIR/2025/1004',
        tourist: tourists[1]._id,
        alert: alerts[1]._id,
        incidentType: 'Other',
        severity: 'High',
        location: { latitude: 34.0837, longitude: 77.577, address: 'Leh Military Zone, Ladakh' },
        incidentDate: new Date(Date.now() - 7200000),
        description: 'Tourist Priya Nair found near restricted Leh Air Force Station area without permit.',
        status: 'Pending',
        source: 'Zone Alert System',
        assignedOfficer: authority1._id,
        responseAction: 'E-FIR Generated – Ladakh UT Police informed',
      },
      {
        efirNumber: 'EFIR/2025/1005',
        tourist: tourists[7]._id,
        alert: alerts[6]._id,
        incidentType: 'Medical Emergency',
        severity: 'Medium',
        location: { latitude: 26.8467, longitude: 80.9462, address: 'Bara Imambara, Lucknow, Uttar Pradesh' },
        incidentDate: new Date(Date.now() - 1800000),
        description: 'Tourist Kavita Reddy collapsed due to heat stroke during Lucknow heritage walk in 42°C weather.',
        status: 'Pending',
        source: 'Emergency Alert',
        assignedOfficer: authority2._id,
        responseAction: '108 Ambulance dispatched from King George Medical University',
      },
      {
        efirNumber: 'EFIR/2025/1006',
        tourist: tourists[4]._id,
        incidentType: 'Harassment',
        severity: 'Low',
        location: { latitude: 15.2993, longitude: 74.124, address: 'Calangute Beach, North Goa' },
        incidentDate: new Date(Date.now() - 259200000),
        description: 'Tourist Rohan Desai reported harassment by unauthorized beach vendors at Calangute.',
        status: 'Verified',
        source: 'Tourist Report',
        assignedOfficer: authority2._id,
        verifiedBy: authority2._id,
        verifiedAt: new Date(Date.now() - 172800000),
        responseAction: 'Warning issued to vendors by Goa Tourism Police',
      },
      {
        efirNumber: 'EFIR/2025/1007',
        tourist: tourists[6]._id,
        incidentType: 'Lost Documents',
        severity: 'Medium',
        location: { latitude: 13.0827, longitude: 80.2707, address: 'Marina Beach, Chennai, Tamil Nadu' },
        incidentDate: new Date(Date.now() - 43200000),
        description: 'Tourist Rahul Verma lost Aadhaar card and driving licence at Marina Beach, Chennai.',
        status: 'Verified',
        source: 'Tourist Report',
        assignedOfficer: authority1._id,
        verifiedBy: authority1._id,
        verifiedAt: new Date(Date.now() - 21600000),
        responseAction: 'Documents recovered from Chennai Police Lost & Found cell',
      },
      {
        efirNumber: 'EFIR/2025/1008',
        tourist: tourists[2]._id,
        incidentType: 'Accident',
        severity: 'Low',
        location: { latitude: 26.9124, longitude: 75.7873, address: 'Hawa Mahal Road, Jaipur, Rajasthan' },
        incidentDate: new Date(Date.now() - 604800000),
        description: 'Minor two-wheeler accident involving tourist Akash Patel near Hawa Mahal. No serious injuries.',
        status: 'Closed',
        source: 'Rajasthan Police Patrol',
        assignedOfficer: authority2._id,
        verifiedBy: authority2._id,
        verifiedAt: new Date(Date.now() - 518400000),
        responseAction: 'Case closed – insurance claim processed via Rajasthan Tourism',
      },
    ]);

    console.log('Created 8 E-FIR records...');

    await Broadcast.insertMany([
      {
        title: 'IMD Weather Alert – North India',
        message: 'India Meteorological Department warns of heavy rainfall across Delhi, Uttarakhand, and Himachal Pradesh. Tourists advised to avoid hilly areas and stay indoors.',
        broadcastType: 'All Tourists',
        isEmergency: true,
        recipientsCount: 8,
        sentBy: authority1._id,
        status: 'Sent',
      },
      {
        title: 'Ladakh Border Restriction Notice',
        message: 'Ministry of Home Affairs: All areas near LOC in Kargil and Drass are temporarily restricted. Valid Inner Line Permit mandatory for Ladakh travel.',
        broadcastType: 'Region',
        isEmergency: true,
        region: 'Ladakh',
        recipientsCount: 2,
        sentBy: authority1._id,
        status: 'Sent',
      },
      {
        title: 'Delhi Safe Zone Advisory',
        message: 'Connaught Place, India Gate, and Rajpath areas are designated safe tourist zones with 24/7 Delhi Police patrolling. Dial 112 for emergencies.',
        broadcastType: 'Radius',
        isEmergency: false,
        radius: 5000,
        centerLocation: { latitude: 28.6139, longitude: 77.209 },
        recipientsCount: 1,
        sentBy: authority2._id,
        status: 'Sent',
      },
      {
        title: 'Goa Beach Safety Alert',
        message: 'Goa Tourism Board: High tide warning for Calangute and Baga beaches. Red flag hoisted – swimming strictly prohibited until further notice.',
        broadcastType: 'Zone',
        isEmergency: true,
        targetZone: zones[7]._id,
        recipientsCount: 1,
        sentBy: authority2._id,
        status: 'Sent',
      },
      {
        title: 'Maharashtra Monsoon Travel Advisory',
        message: 'Maharashtra Disaster Management: Landslides reported on Mumbai-Pune Expressway and Lonavala ghat section. Avoid travel until clearance issued.',
        broadcastType: 'Region',
        isEmergency: true,
        region: 'Maharashtra',
        recipientsCount: 0,
        sentBy: authority1._id,
        status: 'Sent',
      },
      {
        title: 'Diwali Security Advisory – All India',
        message: 'Enhanced security across major tourist destinations for Diwali celebrations. Report suspicious activity to local police or dial 112.',
        broadcastType: 'All Tourists',
        isEmergency: false,
        recipientsCount: 8,
        sentBy: admin._id,
        status: 'Sent',
      },
      {
        title: 'Kedarnath Yatra Health Advisory',
        message: 'Uttarakhand Government: Acclimatize 48 hours before Kedarnath trek. Carry warm clothing and ORS. Medical camps available at Gaurikund and Kedarnath.',
        broadcastType: 'Zone',
        isEmergency: false,
        targetZone: zones[3]._id,
        recipientsCount: 1,
        sentBy: authority2._id,
        status: 'Sent',
      },
      {
        title: 'National Tourism Helpline Reminder',
        message: 'Dial 1363 (Ministry of Tourism India helpline) or 112 (Emergency) for any assistance. Stay registered on STSMS for live safety monitoring.',
        broadcastType: 'All Tourists',
        isEmergency: false,
        recipientsCount: 8,
        sentBy: admin._id,
        status: 'Sent',
      },
    ]);

    console.log('Created 8 broadcast records...');
    console.log('\n========== SEED COMPLETED SUCCESSFULLY ==========');
    console.log('\nLogin Credentials (All Indian Data):');
    console.log('  Admin:     admin@stsms.gov.in / admin123');
    console.log('  Authority: rajesh@police.gov.in / police123');
    console.log('  Authority: priya@police.gov.in / police123');
    console.log('  Tourist:   arjun.sharma@gmail.com / tourist123');
    console.log('================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedData();
