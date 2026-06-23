const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const checkZoneAlerts = async (tourist, latitude, longitude, Alert, Zone) => {
  const zones = await Zone.find({ status: 'Active', zoneType: { $in: ['Restricted', 'Risky'] } });
  const alertsCreated = [];

  for (const zone of zones) {
    const dist = getDistance(latitude, longitude, zone.location.latitude, zone.location.longitude);
    if (dist <= zone.radius) {
      const recentAlert = await Alert.findOne({
        tourist: tourist._id,
        alertType: 'Restricted zone alert',
        status: 'Pending',
        'location.address': { $regex: zone.name, $options: 'i' },
        createdAt: { $gte: new Date(Date.now() - 3600000) },
      });

      if (!recentAlert) {
        const severity = zone.zoneType === 'Restricted' ? 'Critical' : 'High';
        const alert = await Alert.create({
          tourist: tourist._id,
          alertType: zone.zoneType === 'Restricted' ? 'Restricted zone alert' : 'Location-based alert',
          severity,
          status: 'Pending',
          location: { latitude, longitude, address: `${zone.name} - ${zone.location.address}` },
          description: `Tourist entered ${zone.zoneType.toLowerCase()} zone: ${zone.name}`,
        });
        alertsCreated.push(alert);
        tourist.totalAlerts += 1;
        if (zone.zoneType === 'Restricted') {
          tourist.safetyStatus = 'Critical';
          tourist.safetyScore = Math.max(0, tourist.safetyScore - 25);
        } else if (tourist.safetyStatus === 'Safe') {
          tourist.safetyStatus = 'At Risk';
          tourist.safetyScore = Math.max(0, tourist.safetyScore - 10);
        }
      }
    }
  }

  return alertsCreated;
};

module.exports = { getDistance, checkZoneAlerts };
