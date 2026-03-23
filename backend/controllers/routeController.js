const Route = require('../models/Route');
const logger = require('../utils/logger');

exports.createRoute = async (req, res) => {
  try {
    const route = await Route.create(req.body);

    logger.info(`Route created: ${route.routeNumber}`, { createdBy: req.user.id });

    res.status(201).json({
      success: true,
      message: 'Route created successfully',
      route
    });
  } catch (error) {
    logger.error('Route creation error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error creating route',
      error: error.message
    });
  }
};

exports.getAllRoutes = async (req, res) => {
  try {
    const { source, destination, isActive } = req.query;

    const query = {};
    if (source) query.source = { $regex: source, $options: 'i' };
    if (destination) query.destination = { $regex: destination, $options: 'i' };
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const routes = await Route.find(query).sort({ routeNumber: 1 });

    res.json({
      success: true,
      count: routes.length,
      routes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching routes',
      error: error.message
    });
  }
};

exports.getRoute = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    res.json({
      success: true,
      route
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching route',
      error: error.message
    });
  }
};

exports.updateRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    logger.info(`Route updated: ${route.routeNumber}`, { updatedBy: req.user.id });

    res.json({
      success: true,
      message: 'Route updated successfully',
      route
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating route',
      error: error.message
    });
  }
};

exports.deleteRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    logger.info(`Route deactivated: ${route.routeNumber}`);

    res.json({
      success: true,
      message: 'Route deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting route',
      error: error.message
    });
  }
};

exports.updateFare = async (req, res) => {
  try {
    const { fare, discountFares } = req.body;

    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    if (fare !== undefined) route.fare = fare;
    if (discountFares) {
      route.discountFares = { ...route.discountFares, ...discountFares };
    }

    await route.save();

    logger.info(`Fare updated for route: ${route.routeNumber}`, { updatedBy: req.user.id });

    res.json({
      success: true,
      message: 'Fare updated successfully',
      route
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating fare',
      error: error.message
    });
  }
};

exports.searchRoutes = async (req, res) => {
  try {
    const { q } = req.query;

    const routes = await Route.find({
      isActive: true,
      $or: [
        { routeNumber: { $regex: q, $options: 'i' } },
        { source: { $regex: q, $options: 'i' } },
        { destination: { $regex: q, $options: 'i' } }
      ]
    }).limit(10);

    res.json({
      success: true,
      routes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching routes',
      error: error.message
    });
  }
};
