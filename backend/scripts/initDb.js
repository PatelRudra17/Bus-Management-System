const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Route = require('../models/Route');

const sampleRoutes = [
  {
    routeNumber: 'BRTS-101',
    source: 'Ahmedabad Railway Station',
    destination: 'Naroda GIDC',
    stops: [
      { name: 'Ahmedabad Railway Station', sequence: 1, distance: 0 },
      { name: 'Kalupur', sequence: 2, distance: 2 },
      { name: 'Saraspur', sequence: 3, distance: 5 },
      { name: 'Odhav', sequence: 4, distance: 10 },
      { name: 'Naroda GIDC', sequence: 5, distance: 15 }
    ],
    distance: 15, fare: 25, busType: 'ac',
    duration: '40 mins', totalSeats: 60, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  {
    routeNumber: 'BRTS-102',
    source: 'Iscon Cross Road',
    destination: 'Vastral',
    stops: [
      { name: 'Iscon Cross Road', sequence: 1, distance: 0 },
      { name: 'Shivranjani', sequence: 2, distance: 3 },
      { name: 'Nehru Nagar', sequence: 3, distance: 7 },
      { name: 'Maninagar', sequence: 4, distance: 12 },
      { name: 'Vastral', sequence: 5, distance: 18 }
    ],
    distance: 18, fare: 30, busType: 'ac',
    duration: '50 mins', totalSeats: 60, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  {
    routeNumber: 'AMTS-201',
    source: 'Lal Darwaja',
    destination: 'Bopal',
    stops: [
      { name: 'Lal Darwaja', sequence: 1, distance: 0 },
      { name: 'Ellis Bridge', sequence: 2, distance: 3 },
      { name: 'Paldi', sequence: 3, distance: 6 },
      { name: 'Vasna', sequence: 4, distance: 10 },
      { name: 'Jodhpur', sequence: 5, distance: 14 },
      { name: 'Bopal', sequence: 6, distance: 20 }
    ],
    distance: 20, fare: 20, busType: 'standard',
    duration: '55 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '05:30', end: '23:00' }
  },
  {
    routeNumber: 'AMTS-202',
    source: 'Lal Darwaja',
    destination: 'Sarkhej',
    stops: [
      { name: 'Lal Darwaja', sequence: 1, distance: 0 },
      { name: 'Paldi', sequence: 2, distance: 5 },
      { name: 'Ambawadi', sequence: 3, distance: 8 },
      { name: 'Satellite', sequence: 4, distance: 12 },
      { name: 'Sarkhej', sequence: 5, distance: 18 }
    ],
    distance: 18, fare: 20, busType: 'standard',
    duration: '50 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '05:30', end: '23:00' }
  },
  {
    routeNumber: 'BRTS-103',
    source: 'Ranip',
    destination: 'Maninagar',
    stops: [
      { name: 'Ranip', sequence: 1, distance: 0 },
      { name: 'Chandkheda', sequence: 2, distance: 4 },
      { name: 'Sabarmati', sequence: 3, distance: 8 },
      { name: 'Kalupur', sequence: 4, distance: 14 },
      { name: 'Maninagar', sequence: 5, distance: 22 }
    ],
    distance: 22, fare: 35, busType: 'ac',
    duration: '60 mins', totalSeats: 60, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  {
    routeNumber: 'AMTS-203',
    source: 'Naroda',
    destination: 'Vatva GIDC',
    stops: [
      { name: 'Naroda', sequence: 1, distance: 0 },
      { name: 'Bapunagar', sequence: 2, distance: 5 },
      { name: 'Gomtipur', sequence: 3, distance: 9 },
      { name: 'Vatva GIDC', sequence: 4, distance: 16 }
    ],
    distance: 16, fare: 18, busType: 'standard',
    duration: '45 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '05:30', end: '22:30' }
  },
  {
    routeNumber: 'BRTS-104',
    source: 'Ahmedabad Airport',
    destination: 'GIFT City',
    stops: [
      { name: 'Ahmedabad Airport', sequence: 1, distance: 0 },
      { name: 'Hansol', sequence: 2, distance: 5 },
      { name: 'Chandkheda', sequence: 3, distance: 10 },
      { name: 'GIFT City', sequence: 4, distance: 20 }
    ],
    distance: 20, fare: 50, busType: 'luxury',
    duration: '45 mins', totalSeats: 40, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  {
    routeNumber: 'AMTS-204',
    source: 'Gota',
    destination: 'SG Highway',
    stops: [
      { name: 'Gota', sequence: 1, distance: 0 },
      { name: 'Sola', sequence: 2, distance: 4 },
      { name: 'Thaltej', sequence: 3, distance: 8 },
      { name: 'SG Highway', sequence: 4, distance: 12 }
    ],
    distance: 12, fare: 15, busType: 'standard',
    duration: '35 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  {
    routeNumber: 'BRTS-105',
    source: 'Paldi',
    destination: 'Gandhinagar Sector-11',
    stops: [
      { name: 'Paldi', sequence: 1, distance: 0 },
      { name: 'Ellis Bridge', sequence: 2, distance: 3 },
      { name: 'Kalupur', sequence: 3, distance: 7 },
      { name: 'Koba Circle', sequence: 4, distance: 20 },
      { name: 'Gandhinagar Sector-11', sequence: 5, distance: 30 }
    ],
    distance: 30, fare: 45, busType: 'ac',
    duration: '75 mins', totalSeats: 60, isActive: true,
    operatingHours: { start: '06:00', end: '21:00' }
  },
  {
    routeNumber: 'AMTS-205',
    source: 'Maninagar',
    destination: 'Narol',
    stops: [
      { name: 'Maninagar', sequence: 1, distance: 0 },
      { name: 'Isanpur', sequence: 2, distance: 5 },
      { name: 'Narol', sequence: 3, distance: 10 }
    ],
    distance: 10, fare: 12, busType: 'standard',
    duration: '30 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '05:30', end: '23:00' }
  },
  {
    routeNumber: 'AMTS-206',
    source: 'Vastral',
    destination: 'Lal Darwaja',
    stops: [
      { name: 'Vastral', sequence: 1, distance: 0 },
      { name: 'Odhav', sequence: 2, distance: 6 },
      { name: 'Bapunagar', sequence: 3, distance: 11 },
      { name: 'Kalupur', sequence: 4, distance: 16 },
      { name: 'Lal Darwaja', sequence: 5, distance: 20 }
    ],
    distance: 20, fare: 20, busType: 'standard',
    duration: '55 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '05:30', end: '23:00' }
  },
  {
    routeNumber: 'BRTS-106',
    source: 'Sabarmati',
    destination: 'Vatva',
    stops: [
      { name: 'Sabarmati', sequence: 1, distance: 0 },
      { name: 'Kalupur', sequence: 2, distance: 8 },
      { name: 'Maninagar', sequence: 3, distance: 14 },
      { name: 'Vatva', sequence: 4, distance: 22 }
    ],
    distance: 22, fare: 35, busType: 'ac',
    duration: '60 mins', totalSeats: 60, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  // Ahmedabad extra routes
  {
    routeNumber: 'AMTS-207',
    source: 'Chandkheda',
    destination: 'Narol',
    stops: [
      { name: 'Chandkheda', sequence: 1, distance: 0 },
      { name: 'Sabarmati', sequence: 2, distance: 5 },
      { name: 'Kalupur', sequence: 3, distance: 12 },
      { name: 'Maninagar', sequence: 4, distance: 18 },
      { name: 'Narol', sequence: 5, distance: 26 }
    ],
    distance: 26, fare: 22, busType: 'standard',
    duration: '70 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '05:30', end: '23:00' }
  },
  {
    routeNumber: 'BRTS-107',
    source: 'Thaltej',
    destination: 'Vastral',
    stops: [
      { name: 'Thaltej', sequence: 1, distance: 0 },
      { name: 'Bodakdev', sequence: 2, distance: 4 },
      { name: 'Nehru Nagar', sequence: 3, distance: 9 },
      { name: 'Maninagar', sequence: 4, distance: 16 },
      { name: 'Vastral', sequence: 5, distance: 24 }
    ],
    distance: 24, fare: 38, busType: 'ac',
    duration: '65 mins', totalSeats: 60, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  {
    routeNumber: 'AMTS-208',
    source: 'Bopal',
    destination: 'Naroda',
    stops: [
      { name: 'Bopal', sequence: 1, distance: 0 },
      { name: 'Satellite', sequence: 2, distance: 6 },
      { name: 'Ambawadi', sequence: 3, distance: 11 },
      { name: 'Kalupur', sequence: 4, distance: 17 },
      { name: 'Naroda', sequence: 5, distance: 25 }
    ],
    distance: 25, fare: 22, busType: 'standard',
    duration: '68 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '05:30', end: '22:30' }
  },
  // Surat routes
  {
    routeNumber: 'SURAT-101',
    source: 'Surat Railway Station',
    destination: 'Adajan',
    stops: [
      { name: 'Surat Railway Station', sequence: 1, distance: 0 },
      { name: 'Ring Road', sequence: 2, distance: 4 },
      { name: 'Athwa Gate', sequence: 3, distance: 8 },
      { name: 'Adajan', sequence: 4, distance: 14 }
    ],
    distance: 14, fare: 20, busType: 'standard',
    duration: '40 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  {
    routeNumber: 'SURAT-102',
    source: 'Surat Airport',
    destination: 'Vesu',
    stops: [
      { name: 'Surat Airport', sequence: 1, distance: 0 },
      { name: 'Magdalla', sequence: 2, distance: 5 },
      { name: 'Dumas Road', sequence: 3, distance: 9 },
      { name: 'Vesu', sequence: 4, distance: 15 }
    ],
    distance: 15, fare: 25, busType: 'ac',
    duration: '42 mins', totalSeats: 60, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  {
    routeNumber: 'SURAT-103',
    source: 'Udhna Surat',
    destination: 'Pal Surat',
    stops: [
      { name: 'Udhna Surat', sequence: 1, distance: 0 },
      { name: 'Surat Railway Station', sequence: 2, distance: 6 },
      { name: 'Athwa Surat', sequence: 3, distance: 11 },
      { name: 'Pal Surat', sequence: 4, distance: 18 }
    ],
    distance: 18, fare: 18, busType: 'standard',
    duration: '50 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '05:30', end: '23:00' }
  },
  // Vadodara routes
  {
    routeNumber: 'VADODARA-101',
    source: 'Vadodara Railway Station',
    destination: 'Akota',
    stops: [
      { name: 'Vadodara Railway Station', sequence: 1, distance: 0 },
      { name: 'Sayajigunj', sequence: 2, distance: 3 },
      { name: 'Fatehgunj', sequence: 3, distance: 6 },
      { name: 'Akota', sequence: 4, distance: 10 }
    ],
    distance: 10, fare: 15, busType: 'standard',
    duration: '30 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  {
    routeNumber: 'VADODARA-102',
    source: 'Alkapuri',
    destination: 'Waghodia',
    stops: [
      { name: 'Alkapuri', sequence: 1, distance: 0 },
      { name: 'Productivity Road', sequence: 2, distance: 5 },
      { name: 'Makarpura', sequence: 3, distance: 10 },
      { name: 'Waghodia', sequence: 4, distance: 18 }
    ],
    distance: 18, fare: 20, busType: 'standard',
    duration: '48 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  // Rajkot routes
  {
    routeNumber: 'RAJKOT-101',
    source: 'Rajkot Railway Station',
    destination: 'Kalawad Road',
    stops: [
      { name: 'Rajkot Railway Station', sequence: 1, distance: 0 },
      { name: 'Limbda Chowk', sequence: 2, distance: 4 },
      { name: 'University Road', sequence: 3, distance: 8 },
      { name: 'Kalawad Road', sequence: 4, distance: 14 }
    ],
    distance: 14, fare: 18, busType: 'standard',
    duration: '38 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  {
    routeNumber: 'RAJKOT-102',
    source: 'Gondal Road',
    destination: 'Airport Road',
    stops: [
      { name: 'Gondal Road', sequence: 1, distance: 0 },
      { name: 'Rajkot Bus Stand', sequence: 2, distance: 5 },
      { name: 'Mavdi', sequence: 3, distance: 9 },
      { name: 'Airport Road', sequence: 4, distance: 14 }
    ],
    distance: 14, fare: 18, busType: 'standard',
    duration: '38 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  // Gandhinagar routes
  {
    routeNumber: 'GN-101',
    source: 'Gandhinagar Sector-1',
    destination: 'Gandhinagar Sector-28',
    stops: [
      { name: 'Gandhinagar Sector-1', sequence: 1, distance: 0 },
      { name: 'Gandhinagar Sector-7', sequence: 2, distance: 4 },
      { name: 'Gandhinagar Sector-14', sequence: 3, distance: 8 },
      { name: 'Gandhinagar Sector-21', sequence: 4, distance: 12 },
      { name: 'Gandhinagar Sector-28', sequence: 5, distance: 16 }
    ],
    distance: 16, fare: 15, busType: 'standard',
    duration: '40 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '21:00' }
  },
  {
    routeNumber: 'GN-102',
    source: 'Gandhinagar Bus Stand',
    destination: 'GIFT City',
    stops: [
      { name: 'Gandhinagar Bus Stand', sequence: 1, distance: 0 },
      { name: 'Infocity', sequence: 2, distance: 5 },
      { name: 'GIFT City', sequence: 3, distance: 12 }
    ],
    distance: 12, fare: 20, busType: 'ac',
    duration: '30 mins', totalSeats: 60, isActive: true,
    operatingHours: { start: '07:00', end: '21:00' }
  },
  // Mumbai routes
  {
    routeNumber: 'BEST-101',
    source: 'CST Mumbai',
    destination: 'Bandra',
    stops: [
      { name: 'CST Mumbai', sequence: 1, distance: 0 },
      { name: 'Dadar', sequence: 2, distance: 8 },
      { name: 'Mahim', sequence: 3, distance: 13 },
      { name: 'Bandra', sequence: 4, distance: 18 }
    ],
    distance: 18, fare: 30, busType: 'standard',
    duration: '55 mins', totalSeats: 60, isActive: true,
    operatingHours: { start: '05:00', end: '23:30' }
  },
  {
    routeNumber: 'BEST-102',
    source: 'Andheri',
    destination: 'Borivali',
    stops: [
      { name: 'Andheri', sequence: 1, distance: 0 },
      { name: 'Jogeshwari', sequence: 2, distance: 5 },
      { name: 'Goregaon', sequence: 3, distance: 10 },
      { name: 'Malad', sequence: 4, distance: 15 },
      { name: 'Borivali', sequence: 5, distance: 22 }
    ],
    distance: 22, fare: 35, busType: 'standard',
    duration: '65 mins', totalSeats: 60, isActive: true,
    operatingHours: { start: '05:00', end: '23:30' }
  },
  {
    routeNumber: 'BEST-103',
    source: 'Colaba',
    destination: 'Kurla',
    stops: [
      { name: 'Colaba', sequence: 1, distance: 0 },
      { name: 'Fort', sequence: 2, distance: 3 },
      { name: 'Sion', sequence: 3, distance: 12 },
      { name: 'Kurla', sequence: 4, distance: 18 }
    ],
    distance: 18, fare: 28, busType: 'standard',
    duration: '55 mins', totalSeats: 60, isActive: true,
    operatingHours: { start: '05:00', end: '23:30' }
  },
  {
    routeNumber: 'BEST-104',
    source: 'Thane',
    destination: 'Mulund',
    stops: [
      { name: 'Thane', sequence: 1, distance: 0 },
      { name: 'Kopri', sequence: 2, distance: 4 },
      { name: 'Mulund', sequence: 3, distance: 10 }
    ],
    distance: 10, fare: 20, busType: 'standard',
    duration: '30 mins', totalSeats: 60, isActive: true,
    operatingHours: { start: '05:30', end: '23:00' }
  },
  // Pune routes
  {
    routeNumber: 'PMPML-101',
    source: 'Pune Railway Station',
    destination: 'Hinjewadi',
    stops: [
      { name: 'Pune Railway Station', sequence: 1, distance: 0 },
      { name: 'Shivajinagar', sequence: 2, distance: 5 },
      { name: 'Baner', sequence: 3, distance: 14 },
      { name: 'Hinjewadi', sequence: 4, distance: 22 }
    ],
    distance: 22, fare: 35, busType: 'ac',
    duration: '60 mins', totalSeats: 55, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  {
    routeNumber: 'PMPML-102',
    source: 'Swargate',
    destination: 'Kothrud',
    stops: [
      { name: 'Swargate', sequence: 1, distance: 0 },
      { name: 'Deccan', sequence: 2, distance: 4 },
      { name: 'Karve Road', sequence: 3, distance: 8 },
      { name: 'Kothrud', sequence: 4, distance: 13 }
    ],
    distance: 13, fare: 20, busType: 'standard',
    duration: '38 mins', totalSeats: 55, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  // Delhi routes
  {
    routeNumber: 'DTC-101',
    source: 'New Delhi Railway Station',
    destination: 'Dwarka Sector-21',
    stops: [
      { name: 'New Delhi Railway Station', sequence: 1, distance: 0 },
      { name: 'Connaught Place', sequence: 2, distance: 4 },
      { name: 'Dhaula Kuan', sequence: 3, distance: 12 },
      { name: 'Dwarka Sector-10', sequence: 4, distance: 22 },
      { name: 'Dwarka Sector-21', sequence: 5, distance: 28 }
    ],
    distance: 28, fare: 40, busType: 'ac',
    duration: '75 mins', totalSeats: 60, isActive: true,
    operatingHours: { start: '05:30', end: '23:00' }
  },
  {
    routeNumber: 'DTC-102',
    source: 'Rohini Sector-1',
    destination: 'Connaught Place',
    stops: [
      { name: 'Rohini Sector-1', sequence: 1, distance: 0 },
      { name: 'Rohini Sector-15', sequence: 2, distance: 5 },
      { name: 'Pitampura', sequence: 3, distance: 10 },
      { name: 'Netaji Subhash Place', sequence: 4, distance: 15 },
      { name: 'Connaught Place', sequence: 5, distance: 22 }
    ],
    distance: 22, fare: 30, busType: 'standard',
    duration: '60 mins', totalSeats: 60, isActive: true,
    operatingHours: { start: '05:30', end: '23:00' }
  },
  {
    routeNumber: 'DTC-103',
    source: 'Noida Sector-18',
    destination: 'India Gate',
    stops: [
      { name: 'Noida Sector-18', sequence: 1, distance: 0 },
      { name: 'Noida Sector-62', sequence: 2, distance: 8 },
      { name: 'Akshardham', sequence: 3, distance: 18 },
      { name: 'India Gate', sequence: 4, distance: 26 }
    ],
    distance: 26, fare: 38, busType: 'ac',
    duration: '70 mins', totalSeats: 60, isActive: true,
    operatingHours: { start: '06:00', end: '22:30' }
  },
  // Bengaluru routes
  {
    routeNumber: 'BMTC-101',
    source: 'Majestic Bus Stand',
    destination: 'Electronic City',
    stops: [
      { name: 'Majestic Bus Stand', sequence: 1, distance: 0 },
      { name: 'Jayanagar', sequence: 2, distance: 7 },
      { name: 'BTM Layout', sequence: 3, distance: 13 },
      { name: 'Silk Board', sequence: 4, distance: 18 },
      { name: 'Electronic City', sequence: 5, distance: 26 }
    ],
    distance: 26, fare: 40, busType: 'ac',
    duration: '70 mins', totalSeats: 55, isActive: true,
    operatingHours: { start: '05:30', end: '23:00' }
  },
  {
    routeNumber: 'BMTC-102',
    source: 'Whitefield',
    destination: 'MG Road',
    stops: [
      { name: 'Whitefield', sequence: 1, distance: 0 },
      { name: 'Marathahalli', sequence: 2, distance: 8 },
      { name: 'Indiranagar', sequence: 3, distance: 16 },
      { name: 'MG Road', sequence: 4, distance: 22 }
    ],
    distance: 22, fare: 35, busType: 'ac',
    duration: '65 mins', totalSeats: 55, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  {
    routeNumber: 'BMTC-103',
    source: 'Mysuru Road',
    destination: 'Hebbal',
    stops: [
      { name: 'Mysuru Road', sequence: 1, distance: 0 },
      { name: 'Rajajinagar', sequence: 2, distance: 6 },
      { name: 'Yeshwanthpur', sequence: 3, distance: 12 },
      { name: 'Hebbal', sequence: 4, distance: 20 }
    ],
    distance: 20, fare: 28, busType: 'standard',
    duration: '55 mins', totalSeats: 55, isActive: true,
    operatingHours: { start: '05:30', end: '23:00' }
  },
  // Chennai routes
  {
    routeNumber: 'MTC-101',
    source: 'Chennai Central',
    destination: 'Tambaram',
    stops: [
      { name: 'Chennai Central', sequence: 1, distance: 0 },
      { name: 'Guindy', sequence: 2, distance: 10 },
      { name: 'Chrompet', sequence: 3, distance: 18 },
      { name: 'Tambaram', sequence: 4, distance: 25 }
    ],
    distance: 25, fare: 30, busType: 'standard',
    duration: '65 mins', totalSeats: 55, isActive: true,
    operatingHours: { start: '05:00', end: '23:00' }
  },
  {
    routeNumber: 'MTC-102',
    source: 'Anna Nagar',
    destination: 'OMR',
    stops: [
      { name: 'Anna Nagar', sequence: 1, distance: 0 },
      { name: 'Koyambedu', sequence: 2, distance: 5 },
      { name: 'T Nagar', sequence: 3, distance: 12 },
      { name: 'Adyar', sequence: 4, distance: 18 },
      { name: 'OMR', sequence: 5, distance: 26 }
    ],
    distance: 26, fare: 32, busType: 'standard',
    duration: '70 mins', totalSeats: 55, isActive: true,
    operatingHours: { start: '05:00', end: '23:00' }
  },
  // Coimbatore routes
  {
    routeNumber: 'TNSTC-101',
    source: 'Coimbatore Bus Stand',
    destination: 'Gandhipuram',
    stops: [
      { name: 'Coimbatore Bus Stand', sequence: 1, distance: 0 },
      { name: 'RS Puram', sequence: 2, distance: 4 },
      { name: 'Gandhipuram', sequence: 3, distance: 8 }
    ],
    distance: 8, fare: 12, busType: 'standard',
    duration: '25 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  // Jaipur routes
  {
    routeNumber: 'JCTSL-101',
    source: 'Jaipur Railway Station',
    destination: 'Mansarovar',
    stops: [
      { name: 'Jaipur Railway Station', sequence: 1, distance: 0 },
      { name: 'MI Road', sequence: 2, distance: 4 },
      { name: 'Tonk Road', sequence: 3, distance: 9 },
      { name: 'Mansarovar', sequence: 4, distance: 15 }
    ],
    distance: 15, fare: 20, busType: 'standard',
    duration: '42 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  {
    routeNumber: 'JCTSL-102',
    source: 'Sindhi Camp',
    destination: 'Vaishali Nagar',
    stops: [
      { name: 'Sindhi Camp', sequence: 1, distance: 0 },
      { name: 'Ajmer Road', sequence: 2, distance: 5 },
      { name: 'Vaishali Nagar', sequence: 3, distance: 12 }
    ],
    distance: 12, fare: 18, busType: 'standard',
    duration: '35 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  // Lucknow routes
  {
    routeNumber: 'LCTSL-101',
    source: 'Lucknow Railway Station',
    destination: 'Gomti Nagar',
    stops: [
      { name: 'Lucknow Railway Station', sequence: 1, distance: 0 },
      { name: 'Hazratganj', sequence: 2, distance: 4 },
      { name: 'Vibhuti Khand', sequence: 3, distance: 10 },
      { name: 'Gomti Nagar', sequence: 4, distance: 16 }
    ],
    distance: 16, fare: 22, busType: 'standard',
    duration: '45 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  {
    routeNumber: 'LCTSL-102',
    source: 'Alambagh',
    destination: 'Indira Nagar',
    stops: [
      { name: 'Alambagh', sequence: 1, distance: 0 },
      { name: 'Charbagh', sequence: 2, distance: 5 },
      { name: 'Hazratganj', sequence: 3, distance: 10 },
      { name: 'Indira Nagar', sequence: 4, distance: 18 }
    ],
    distance: 18, fare: 22, busType: 'standard',
    duration: '50 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  // Kolkata routes
  {
    routeNumber: 'CSTC-101',
    source: 'Howrah Station',
    destination: 'Salt Lake',
    stops: [
      { name: 'Howrah Station', sequence: 1, distance: 0 },
      { name: 'Esplanade', sequence: 2, distance: 5 },
      { name: 'Park Street', sequence: 3, distance: 8 },
      { name: 'Ultadanga', sequence: 4, distance: 14 },
      { name: 'Salt Lake', sequence: 5, distance: 20 }
    ],
    distance: 20, fare: 25, busType: 'standard',
    duration: '55 mins', totalSeats: 55, isActive: true,
    operatingHours: { start: '05:00', end: '23:00' }
  },
  {
    routeNumber: 'CSTC-102',
    source: 'Durgapur Bus Stand',
    destination: 'City Centre Durgapur',
    stops: [
      { name: 'Durgapur Bus Stand', sequence: 1, distance: 0 },
      { name: 'Benachity', sequence: 2, distance: 4 },
      { name: 'City Centre Durgapur', sequence: 3, distance: 9 }
    ],
    distance: 9, fare: 12, busType: 'standard',
    duration: '28 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  // Nagpur routes
  {
    routeNumber: 'NAGPUR-101',
    source: 'Nagpur Railway Station',
    destination: 'Sitabuldi',
    stops: [
      { name: 'Nagpur Railway Station', sequence: 1, distance: 0 },
      { name: 'Gandhibagh', sequence: 2, distance: 3 },
      { name: 'Sitabuldi', sequence: 3, distance: 7 }
    ],
    distance: 7, fare: 12, busType: 'standard',
    duration: '22 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  {
    routeNumber: 'NAGPUR-102',
    source: 'Nagpur Airport',
    destination: 'Dharampeth',
    stops: [
      { name: 'Nagpur Airport', sequence: 1, distance: 0 },
      { name: 'Wardha Road', sequence: 2, distance: 5 },
      { name: 'Sitabuldi', sequence: 3, distance: 10 },
      { name: 'Dharampeth', sequence: 4, distance: 14 }
    ],
    distance: 14, fare: 20, busType: 'ac',
    duration: '38 mins', totalSeats: 55, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  {
    routeNumber: 'NAGPUR-103',
    source: 'Nagpur MIDC',
    destination: 'Manish Nagar',
    stops: [
      { name: 'Nagpur MIDC', sequence: 1, distance: 0 },
      { name: 'Hingna Road', sequence: 2, distance: 6 },
      { name: 'Manish Nagar', sequence: 3, distance: 12 }
    ],
    distance: 12, fare: 15, busType: 'standard',
    duration: '32 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '05:30', end: '22:30' }
  },
  // Nashik routes
  {
    routeNumber: 'NASHIK-101',
    source: 'Nashik Road Railway Station',
    destination: 'Gangapur Road',
    stops: [
      { name: 'Nashik Road Railway Station', sequence: 1, distance: 0 },
      { name: 'CBS Nashik', sequence: 2, distance: 6 },
      { name: 'Gangapur Road', sequence: 3, distance: 12 }
    ],
    distance: 12, fare: 15, busType: 'standard',
    duration: '35 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  {
    routeNumber: 'NASHIK-102',
    source: 'Nashik Satpur',
    destination: 'Panchavati',
    stops: [
      { name: 'Nashik Satpur', sequence: 1, distance: 0 },
      { name: 'Nashik Road', sequence: 2, distance: 5 },
      { name: 'CBS Nashik', sequence: 3, distance: 9 },
      { name: 'Panchavati', sequence: 4, distance: 14 }
    ],
    distance: 14, fare: 18, busType: 'standard',
    duration: '40 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  // New Delhi routes
  {
    routeNumber: 'DTC-104',
    source: 'New Delhi ISBT',
    destination: 'Lajpat Nagar',
    stops: [
      { name: 'New Delhi ISBT', sequence: 1, distance: 0 },
      { name: 'Kashmere Gate', sequence: 2, distance: 3 },
      { name: 'ITO', sequence: 3, distance: 8 },
      { name: 'Lajpat Nagar', sequence: 4, distance: 14 }
    ],
    distance: 14, fare: 22, busType: 'standard',
    duration: '40 mins', totalSeats: 60, isActive: true,
    operatingHours: { start: '05:30', end: '23:00' }
  },
  {
    routeNumber: 'DTC-105',
    source: 'New Delhi Saket',
    destination: 'Janakpuri',
    stops: [
      { name: 'New Delhi Saket', sequence: 1, distance: 0 },
      { name: 'Vasant Kunj', sequence: 2, distance: 5 },
      { name: 'Dwarka Mor', sequence: 3, distance: 12 },
      { name: 'Janakpuri', sequence: 4, distance: 18 }
    ],
    distance: 18, fare: 28, busType: 'ac',
    duration: '50 mins', totalSeats: 60, isActive: true,
    operatingHours: { start: '05:30', end: '23:00' }
  },
  // Mysuru routes
  {
    routeNumber: 'MYSURU-101',
    source: 'Mysuru Railway Station',
    destination: 'Mysuru Palace',
    stops: [
      { name: 'Mysuru Railway Station', sequence: 1, distance: 0 },
      { name: 'Sayyaji Rao Road', sequence: 2, distance: 3 },
      { name: 'Mysuru Palace', sequence: 3, distance: 6 }
    ],
    distance: 6, fare: 10, busType: 'standard',
    duration: '20 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  {
    routeNumber: 'MYSURU-102',
    source: 'Mysuru Bus Stand',
    destination: 'Vijayanagar Mysuru',
    stops: [
      { name: 'Mysuru Bus Stand', sequence: 1, distance: 0 },
      { name: 'Kuvempunagar', sequence: 2, distance: 5 },
      { name: 'Vijayanagar Mysuru', sequence: 3, distance: 10 }
    ],
    distance: 10, fare: 14, busType: 'standard',
    duration: '30 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  {
    routeNumber: 'MYSURU-103',
    source: 'Mysuru Hebbal',
    destination: 'Nanjangud Road',
    stops: [
      { name: 'Mysuru Hebbal', sequence: 1, distance: 0 },
      { name: 'Yadavagiri', sequence: 2, distance: 4 },
      { name: 'Nanjangud Road', sequence: 3, distance: 10 }
    ],
    distance: 10, fare: 14, busType: 'standard',
    duration: '30 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  // Hubli routes
  {
    routeNumber: 'HUBLI-101',
    source: 'Hubli Railway Station',
    destination: 'Dharwad',
    stops: [
      { name: 'Hubli Railway Station', sequence: 1, distance: 0 },
      { name: 'Hubli Bus Stand', sequence: 2, distance: 3 },
      { name: 'Unkal', sequence: 3, distance: 8 },
      { name: 'Dharwad', sequence: 4, distance: 20 }
    ],
    distance: 20, fare: 25, busType: 'standard',
    duration: '50 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  {
    routeNumber: 'HUBLI-102',
    source: 'Hubli Vidyanagar',
    destination: 'Gokul Road Hubli',
    stops: [
      { name: 'Hubli Vidyanagar', sequence: 1, distance: 0 },
      { name: 'Hubli Bus Stand', sequence: 2, distance: 4 },
      { name: 'Gokul Road Hubli', sequence: 3, distance: 9 }
    ],
    distance: 9, fare: 12, busType: 'standard',
    duration: '28 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  // Madurai routes
  {
    routeNumber: 'MADURAI-101',
    source: 'Madurai Railway Station',
    destination: 'Meenakshi Amman Temple',
    stops: [
      { name: 'Madurai Railway Station', sequence: 1, distance: 0 },
      { name: 'Tallakulam', sequence: 2, distance: 3 },
      { name: 'Meenakshi Amman Temple', sequence: 3, distance: 6 }
    ],
    distance: 6, fare: 10, busType: 'standard',
    duration: '20 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '05:30', end: '23:00' }
  },
  {
    routeNumber: 'MADURAI-102',
    source: 'Madurai Anna Nagar',
    destination: 'Mattuthavani',
    stops: [
      { name: 'Madurai Anna Nagar', sequence: 1, distance: 0 },
      { name: 'KK Nagar Madurai', sequence: 2, distance: 5 },
      { name: 'Mattuthavani', sequence: 3, distance: 11 }
    ],
    distance: 11, fare: 14, busType: 'standard',
    duration: '32 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '05:30', end: '23:00' }
  },
  {
    routeNumber: 'MADURAI-103',
    source: 'Madurai Bypass',
    destination: 'Avaniyapuram',
    stops: [
      { name: 'Madurai Bypass', sequence: 1, distance: 0 },
      { name: 'Madurai Railway Station', sequence: 2, distance: 6 },
      { name: 'Avaniyapuram', sequence: 3, distance: 13 }
    ],
    distance: 13, fare: 16, busType: 'standard',
    duration: '36 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '05:30', end: '23:00' }
  },
  // Jodhpur routes
  {
    routeNumber: 'JODHPUR-101',
    source: 'Jodhpur Railway Station',
    destination: 'Mehrangarh Fort',
    stops: [
      { name: 'Jodhpur Railway Station', sequence: 1, distance: 0 },
      { name: 'Sojati Gate', sequence: 2, distance: 3 },
      { name: 'Mehrangarh Fort', sequence: 3, distance: 7 }
    ],
    distance: 7, fare: 12, busType: 'standard',
    duration: '22 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  {
    routeNumber: 'JODHPUR-102',
    source: 'Jodhpur Paota',
    destination: 'Shastri Nagar Jodhpur',
    stops: [
      { name: 'Jodhpur Paota', sequence: 1, distance: 0 },
      { name: 'Jodhpur Bus Stand', sequence: 2, distance: 4 },
      { name: 'Shastri Nagar Jodhpur', sequence: 3, distance: 10 }
    ],
    distance: 10, fare: 14, busType: 'standard',
    duration: '30 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  // Udaipur routes
  {
    routeNumber: 'UDAIPUR-101',
    source: 'Udaipur Railway Station',
    destination: 'City Palace Udaipur',
    stops: [
      { name: 'Udaipur Railway Station', sequence: 1, distance: 0 },
      { name: 'Chetak Circle', sequence: 2, distance: 3 },
      { name: 'City Palace Udaipur', sequence: 3, distance: 7 }
    ],
    distance: 7, fare: 12, busType: 'standard',
    duration: '22 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  {
    routeNumber: 'UDAIPUR-102',
    source: 'Udaipur Hiran Magri',
    destination: 'Fatehsagar Lake',
    stops: [
      { name: 'Udaipur Hiran Magri', sequence: 1, distance: 0 },
      { name: 'Sector-11 Udaipur', sequence: 2, distance: 4 },
      { name: 'Fatehsagar Lake', sequence: 3, distance: 9 }
    ],
    distance: 9, fare: 12, busType: 'standard',
    duration: '28 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  // Kanpur routes
  {
    routeNumber: 'KANPUR-101',
    source: 'Kanpur Central Railway Station',
    destination: 'Kidwai Nagar Kanpur',
    stops: [
      { name: 'Kanpur Central Railway Station', sequence: 1, distance: 0 },
      { name: 'Mall Road Kanpur', sequence: 2, distance: 4 },
      { name: 'Kidwai Nagar Kanpur', sequence: 3, distance: 10 }
    ],
    distance: 10, fare: 14, busType: 'standard',
    duration: '30 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  {
    routeNumber: 'KANPUR-102',
    source: 'Kanpur Rawatpur',
    destination: 'Govind Nagar Kanpur',
    stops: [
      { name: 'Kanpur Rawatpur', sequence: 1, distance: 0 },
      { name: 'IIT Kanpur', sequence: 2, distance: 5 },
      { name: 'Govind Nagar Kanpur', sequence: 3, distance: 12 }
    ],
    distance: 12, fare: 16, busType: 'standard',
    duration: '35 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  // Agra routes
  {
    routeNumber: 'AGRA-101',
    source: 'Agra Cantt Railway Station',
    destination: 'Taj Mahal Agra',
    stops: [
      { name: 'Agra Cantt Railway Station', sequence: 1, distance: 0 },
      { name: 'Agra Fort', sequence: 2, distance: 4 },
      { name: 'Taj Mahal Agra', sequence: 3, distance: 8 }
    ],
    distance: 8, fare: 12, busType: 'standard',
    duration: '25 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  {
    routeNumber: 'AGRA-102',
    source: 'Agra Idgah Bus Stand',
    destination: 'Sikandra Agra',
    stops: [
      { name: 'Agra Idgah Bus Stand', sequence: 1, distance: 0 },
      { name: 'Agra Cantt', sequence: 2, distance: 5 },
      { name: 'Sikandra Agra', sequence: 3, distance: 12 }
    ],
    distance: 12, fare: 16, busType: 'standard',
    duration: '35 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  // Varanasi routes
  {
    routeNumber: 'VARANASI-101',
    source: 'Varanasi Junction',
    destination: 'Dashashwamedh Ghat',
    stops: [
      { name: 'Varanasi Junction', sequence: 1, distance: 0 },
      { name: 'Godowlia', sequence: 2, distance: 4 },
      { name: 'Dashashwamedh Ghat', sequence: 3, distance: 7 }
    ],
    distance: 7, fare: 12, busType: 'standard',
    duration: '22 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '05:30', end: '23:00' }
  },
  {
    routeNumber: 'VARANASI-102',
    source: 'Varanasi BHU',
    destination: 'Sarnath',
    stops: [
      { name: 'Varanasi BHU', sequence: 1, distance: 0 },
      { name: 'Varanasi Junction', sequence: 2, distance: 5 },
      { name: 'Sarnath', sequence: 3, distance: 13 }
    ],
    distance: 13, fare: 16, busType: 'standard',
    duration: '38 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '05:30', end: '23:00' }
  },
  // Howrah routes
  {
    routeNumber: 'HOWRAH-101',
    source: 'Howrah Station',
    destination: 'Shibpur Howrah',
    stops: [
      { name: 'Howrah Station', sequence: 1, distance: 0 },
      { name: 'Howrah Maidan', sequence: 2, distance: 3 },
      { name: 'Shibpur Howrah', sequence: 3, distance: 7 }
    ],
    distance: 7, fare: 10, busType: 'standard',
    duration: '22 mins', totalSeats: 55, isActive: true,
    operatingHours: { start: '05:00', end: '23:00' }
  },
  {
    routeNumber: 'HOWRAH-102',
    source: 'Howrah Liluah',
    destination: 'Bally Howrah',
    stops: [
      { name: 'Howrah Liluah', sequence: 1, distance: 0 },
      { name: 'Howrah Station', sequence: 2, distance: 5 },
      { name: 'Bally Howrah', sequence: 3, distance: 11 }
    ],
    distance: 11, fare: 14, busType: 'standard',
    duration: '32 mins', totalSeats: 55, isActive: true,
    operatingHours: { start: '05:00', end: '23:00' }
  },
  // Bengaluru explicit city-name routes
  {
    routeNumber: 'BMTC-104',
    source: 'Bengaluru City Railway Station',
    destination: 'Koramangala',
    stops: [
      { name: 'Bengaluru City Railway Station', sequence: 1, distance: 0 },
      { name: 'Shivajinagar Bengaluru', sequence: 2, distance: 4 },
      { name: 'Koramangala', sequence: 3, distance: 10 }
    ],
    distance: 10, fare: 18, busType: 'standard',
    duration: '30 mins', totalSeats: 55, isActive: true,
    operatingHours: { start: '05:30', end: '23:00' }
  },
  {
    routeNumber: 'BMTC-105',
    source: 'Bengaluru Airport',
    destination: 'Bengaluru Majestic',
    stops: [
      { name: 'Bengaluru Airport', sequence: 1, distance: 0 },
      { name: 'Hebbal Bengaluru', sequence: 2, distance: 12 },
      { name: 'Bengaluru Majestic', sequence: 3, distance: 35 }
    ],
    distance: 35, fare: 55, busType: 'luxury',
    duration: '75 mins', totalSeats: 40, isActive: true,
    operatingHours: { start: '04:00', end: '23:59' }
  },
  {
    routeNumber: 'BMTC-106',
    source: 'Bengaluru Silk Board',
    destination: 'Bengaluru Yelahanka',
    stops: [
      { name: 'Bengaluru Silk Board', sequence: 1, distance: 0 },
      { name: 'Bengaluru Central', sequence: 2, distance: 10 },
      { name: 'Bengaluru Yelahanka', sequence: 3, distance: 22 }
    ],
    distance: 22, fare: 32, busType: 'ac',
    duration: '60 mins', totalSeats: 55, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  // Kolkata explicit city-name routes
  {
    routeNumber: 'CSTC-103',
    source: 'Kolkata Airport',
    destination: 'Kolkata Esplanade',
    stops: [
      { name: 'Kolkata Airport', sequence: 1, distance: 0 },
      { name: 'Kolkata Ultadanga', sequence: 2, distance: 10 },
      { name: 'Kolkata Esplanade', sequence: 3, distance: 20 }
    ],
    distance: 20, fare: 30, busType: 'ac',
    duration: '55 mins', totalSeats: 55, isActive: true,
    operatingHours: { start: '05:00', end: '23:00' }
  },
  {
    routeNumber: 'CSTC-104',
    source: 'Kolkata Jadavpur',
    destination: 'Kolkata Dumdum',
    stops: [
      { name: 'Kolkata Jadavpur', sequence: 1, distance: 0 },
      { name: 'Kolkata Park Street', sequence: 2, distance: 8 },
      { name: 'Kolkata Dumdum', sequence: 3, distance: 18 }
    ],
    distance: 18, fare: 25, busType: 'standard',
    duration: '50 mins', totalSeats: 55, isActive: true,
    operatingHours: { start: '05:00', end: '23:00' }
  },
  {
    routeNumber: 'CSTC-105',
    source: 'Kolkata New Town',
    destination: 'Kolkata Garia',
    stops: [
      { name: 'Kolkata New Town', sequence: 1, distance: 0 },
      { name: 'Kolkata Salt Lake', sequence: 2, distance: 7 },
      { name: 'Kolkata Garia', sequence: 3, distance: 20 }
    ],
    distance: 20, fare: 28, busType: 'standard',
    duration: '55 mins', totalSeats: 55, isActive: true,
    operatingHours: { start: '05:00', end: '23:00' }
  },
  // Mumbai extra routes with city name
  {
    routeNumber: 'BEST-105',
    source: 'Mumbai Central',
    destination: 'Mumbai Goregaon',
    stops: [
      { name: 'Mumbai Central', sequence: 1, distance: 0 },
      { name: 'Mumbai Bandra', sequence: 2, distance: 8 },
      { name: 'Mumbai Goregaon', sequence: 3, distance: 20 }
    ],
    distance: 20, fare: 30, busType: 'standard',
    duration: '60 mins', totalSeats: 60, isActive: true,
    operatingHours: { start: '05:00', end: '23:30' }
  },
  {
    routeNumber: 'BEST-106',
    source: 'Mumbai Airport',
    destination: 'Mumbai Nariman Point',
    stops: [
      { name: 'Mumbai Airport', sequence: 1, distance: 0 },
      { name: 'Mumbai Andheri', sequence: 2, distance: 8 },
      { name: 'Mumbai Dadar', sequence: 3, distance: 18 },
      { name: 'Mumbai Nariman Point', sequence: 4, distance: 28 }
    ],
    distance: 28, fare: 45, busType: 'ac',
    duration: '75 mins', totalSeats: 60, isActive: true,
    operatingHours: { start: '05:00', end: '23:30' }
  },
  // Pune extra routes with city name
  {
    routeNumber: 'PMPML-103',
    source: 'Pune Airport',
    destination: 'Pune Camp',
    stops: [
      { name: 'Pune Airport', sequence: 1, distance: 0 },
      { name: 'Pune Nagar Road', sequence: 2, distance: 5 },
      { name: 'Pune Camp', sequence: 3, distance: 12 }
    ],
    distance: 12, fare: 20, busType: 'standard',
    duration: '35 mins', totalSeats: 55, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  {
    routeNumber: 'PMPML-104',
    source: 'Pune Wakad',
    destination: 'Pune Hadapsar',
    stops: [
      { name: 'Pune Wakad', sequence: 1, distance: 0 },
      { name: 'Pune Shivajinagar', sequence: 2, distance: 10 },
      { name: 'Pune Hadapsar', sequence: 3, distance: 22 }
    ],
    distance: 22, fare: 32, busType: 'ac',
    duration: '60 mins', totalSeats: 55, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  // Nagpur extra
  {
    routeNumber: 'NAGPUR-104',
    source: 'Nagpur Zero Mile',
    destination: 'Nagpur Hingna',
    stops: [
      { name: 'Nagpur Zero Mile', sequence: 1, distance: 0 },
      { name: 'Nagpur Sitabuldi', sequence: 2, distance: 4 },
      { name: 'Nagpur Hingna', sequence: 3, distance: 14 }
    ],
    distance: 14, fare: 18, busType: 'standard',
    duration: '40 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  // Nashik extra
  {
    routeNumber: 'NASHIK-103',
    source: 'Nashik Dwarka',
    destination: 'Nashik Trimbak Road',
    stops: [
      { name: 'Nashik Dwarka', sequence: 1, distance: 0 },
      { name: 'Nashik CBS', sequence: 2, distance: 5 },
      { name: 'Nashik Trimbak Road', sequence: 3, distance: 12 }
    ],
    distance: 12, fare: 15, busType: 'standard',
    duration: '35 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  // Thane explicit
  {
    routeNumber: 'THANE-101',
    source: 'Thane Railway Station',
    destination: 'Thane Wagle Estate',
    stops: [
      { name: 'Thane Railway Station', sequence: 1, distance: 0 },
      { name: 'Thane Naupada', sequence: 2, distance: 3 },
      { name: 'Thane Wagle Estate', sequence: 3, distance: 8 }
    ],
    distance: 8, fare: 12, busType: 'standard',
    duration: '25 mins', totalSeats: 55, isActive: true,
    operatingHours: { start: '05:30', end: '23:00' }
  },
  {
    routeNumber: 'THANE-102',
    source: 'Thane Ghodbunder Road',
    destination: 'Thane Majiwada',
    stops: [
      { name: 'Thane Ghodbunder Road', sequence: 1, distance: 0 },
      { name: 'Thane Hiranandani', sequence: 2, distance: 5 },
      { name: 'Thane Majiwada', sequence: 3, distance: 10 }
    ],
    distance: 10, fare: 14, busType: 'standard',
    duration: '30 mins', totalSeats: 55, isActive: true,
    operatingHours: { start: '05:30', end: '23:00' }
  },
  // Chennai extra
  {
    routeNumber: 'MTC-103',
    source: 'Chennai Airport',
    destination: 'Chennai Broadway',
    stops: [
      { name: 'Chennai Airport', sequence: 1, distance: 0 },
      { name: 'Chennai Guindy', sequence: 2, distance: 8 },
      { name: 'Chennai Broadway', sequence: 3, distance: 20 }
    ],
    distance: 20, fare: 30, busType: 'ac',
    duration: '55 mins', totalSeats: 55, isActive: true,
    operatingHours: { start: '05:00', end: '23:00' }
  },
  // Coimbatore extra
  {
    routeNumber: 'TNSTC-102',
    source: 'Coimbatore Airport',
    destination: 'Coimbatore RS Puram',
    stops: [
      { name: 'Coimbatore Airport', sequence: 1, distance: 0 },
      { name: 'Coimbatore Peelamedu', sequence: 2, distance: 5 },
      { name: 'Coimbatore RS Puram', sequence: 3, distance: 12 }
    ],
    distance: 12, fare: 18, busType: 'standard',
    duration: '35 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  {
    routeNumber: 'TNSTC-103',
    source: 'Coimbatore Ukkadam',
    destination: 'Coimbatore Singanallur',
    stops: [
      { name: 'Coimbatore Ukkadam', sequence: 1, distance: 0 },
      { name: 'Coimbatore Town Hall', sequence: 2, distance: 4 },
      { name: 'Coimbatore Singanallur', sequence: 3, distance: 10 }
    ],
    distance: 10, fare: 14, busType: 'standard',
    duration: '30 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  // Jaipur extra
  {
    routeNumber: 'JCTSL-103',
    source: 'Jaipur Airport',
    destination: 'Jaipur Pink Square',
    stops: [
      { name: 'Jaipur Airport', sequence: 1, distance: 0 },
      { name: 'Jaipur Durgapura', sequence: 2, distance: 6 },
      { name: 'Jaipur Pink Square', sequence: 3, distance: 14 }
    ],
    distance: 14, fare: 22, busType: 'ac',
    duration: '38 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  // Jodhpur extra
  {
    routeNumber: 'JODHPUR-103',
    source: 'Jodhpur Airport',
    destination: 'Jodhpur Ratanada',
    stops: [
      { name: 'Jodhpur Airport', sequence: 1, distance: 0 },
      { name: 'Jodhpur Residency Road', sequence: 2, distance: 5 },
      { name: 'Jodhpur Ratanada', sequence: 3, distance: 10 }
    ],
    distance: 10, fare: 15, busType: 'standard',
    duration: '30 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  // Udaipur extra
  {
    routeNumber: 'UDAIPUR-103',
    source: 'Udaipur Airport',
    destination: 'Udaipur Sukhadia Circle',
    stops: [
      { name: 'Udaipur Airport', sequence: 1, distance: 0 },
      { name: 'Udaipur Pratap Nagar', sequence: 2, distance: 5 },
      { name: 'Udaipur Sukhadia Circle', sequence: 3, distance: 12 }
    ],
    distance: 12, fare: 18, busType: 'standard',
    duration: '35 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  // Lucknow extra
  {
    routeNumber: 'LCTSL-103',
    source: 'Lucknow Airport',
    destination: 'Lucknow Hazratganj',
    stops: [
      { name: 'Lucknow Airport', sequence: 1, distance: 0 },
      { name: 'Lucknow Amausi', sequence: 2, distance: 5 },
      { name: 'Lucknow Hazratganj', sequence: 3, distance: 14 }
    ],
    distance: 14, fare: 22, busType: 'ac',
    duration: '38 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  // Kanpur extra
  {
    routeNumber: 'KANPUR-103',
    source: 'Kanpur Airport',
    destination: 'Kanpur Swaroop Nagar',
    stops: [
      { name: 'Kanpur Airport', sequence: 1, distance: 0 },
      { name: 'Kanpur Chakeri', sequence: 2, distance: 6 },
      { name: 'Kanpur Swaroop Nagar', sequence: 3, distance: 14 }
    ],
    distance: 14, fare: 20, busType: 'standard',
    duration: '38 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  // Agra extra
  {
    routeNumber: 'AGRA-103',
    source: 'Agra Airport',
    destination: 'Agra Sadar Bazar',
    stops: [
      { name: 'Agra Airport', sequence: 1, distance: 0 },
      { name: 'Agra Cantonment', sequence: 2, distance: 5 },
      { name: 'Agra Sadar Bazar', sequence: 3, distance: 10 }
    ],
    distance: 10, fare: 15, busType: 'standard',
    duration: '30 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  // Varanasi extra
  {
    routeNumber: 'VARANASI-103',
    source: 'Varanasi Airport',
    destination: 'Varanasi Cantt',
    stops: [
      { name: 'Varanasi Airport', sequence: 1, distance: 0 },
      { name: 'Varanasi Babatpur', sequence: 2, distance: 8 },
      { name: 'Varanasi Cantt', sequence: 3, distance: 18 }
    ],
    distance: 18, fare: 25, busType: 'standard',
    duration: '48 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  // Durgapur extra
  {
    routeNumber: 'DURGAPUR-101',
    source: 'Durgapur Steel Plant',
    destination: 'Durgapur Bidhannagar',
    stops: [
      { name: 'Durgapur Steel Plant', sequence: 1, distance: 0 },
      { name: 'Durgapur City Centre', sequence: 2, distance: 5 },
      { name: 'Durgapur Bidhannagar', sequence: 3, distance: 10 }
    ],
    distance: 10, fare: 12, busType: 'standard',
    duration: '30 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  },
  {
    routeNumber: 'DURGAPUR-102',
    source: 'Durgapur Nachan Road',
    destination: 'Durgapur Andal',
    stops: [
      { name: 'Durgapur Nachan Road', sequence: 1, distance: 0 },
      { name: 'Durgapur Bus Stand', sequence: 2, distance: 4 },
      { name: 'Durgapur Andal', sequence: 3, distance: 12 }
    ],
    distance: 12, fare: 15, busType: 'standard',
    duration: '35 mins', totalSeats: 50, isActive: true,
    operatingHours: { start: '06:00', end: '22:00' }
  }
];

const initDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/buspassdb');
    console.log('Connected to MongoDB');

    await Route.deleteMany({});
    console.log('Cleared existing routes');

    await Route.insertMany(sampleRoutes);
    console.log('Inserted sample routes');

    const existingAdmin = await User.findOne({ email: 'admin@buspass.com' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await User.create({
        name: 'System Admin',
        email: 'admin@buspass.com',
        password: hashedPassword,
        phone: '9876543210',
        role: 'admin',
        isActive: true
      });
      console.log('Created admin user: admin@buspass.com / admin123');
    } else {
      console.log('Admin user already exists');
    }

    console.log('\nDatabase initialization complete!');
    console.log('\nSample Routes Created:');
    sampleRoutes.forEach(route => {
      console.log(`  - ${route.routeNumber}: ${route.source} → ${route.destination} (₹${route.fare})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initDatabase();
