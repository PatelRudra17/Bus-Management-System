const User = require('../models/User');
const PassApplication = require('../models/PassApplication');
const Route = require('../models/Route');
const Payment = require('../models/Payment');
const logger = require('../utils/logger');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    
    const totalApplications = await PassApplication.countDocuments();
    const pendingApplications = await PassApplication.countDocuments({ status: 'pending' });
    const approvedApplications = await PassApplication.countDocuments({ status: 'approved' });
    const rejectedApplications = await PassApplication.countDocuments({ status: 'rejected' });
    const expiredApplications = await PassApplication.countDocuments({ status: 'expired' });

    const totalRevenue = await Payment.aggregate([
      { $match: { paymentStatus: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const thisMonthRevenue = await Payment.aggregate([
      { 
        $match: { 
          paymentStatus: 'success',
          createdAt: { $gte: new Date(new Date().setDate(1)) }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalRoutes = await Route.countDocuments({ isActive: true });

    const recentApplications = await PassApplication.find()
      .populate('userId', 'name email')
      .populate('routeId', 'routeNumber source destination')
      .sort({ createdAt: -1 })
      .limit(10);

    const monthlyStats = await PassApplication.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) }
        }
      },
      {
        $group: {
          _id: { 
            month: { $month: '$createdAt' },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.month': 1 } }
    ]);

    const revenueByMonth = await Payment.aggregate([
      {
        $match: {
          paymentStatus: 'success',
          createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const passTypeStats = await PassApplication.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$passType', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          admins: totalAdmins
        },
        applications: {
          total: totalApplications,
          pending: pendingApplications,
          approved: approvedApplications,
          rejected: rejectedApplications,
          expired: expiredApplications
        },
        revenue: {
          total: totalRevenue[0]?.total || 0,
          thisMonth: thisMonthRevenue[0]?.total || 0
        },
        routes: {
          active: totalRoutes
        },
        recentApplications,
        charts: {
          monthlyStats,
          revenueByMonth,
          passTypeStats
        }
      }
    });
  } catch (error) {
    logger.error('Dashboard stats error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, isActive } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-notifications');

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-notifications')
      .populate({
        path: 'notifications',
        options: { limit: 10, sort: { createdAt: -1 } }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userApplications = await PassApplication.find({ userId: user._id })
      .populate('routeId')
      .sort({ createdAt: -1 });

    const userPayments = await Payment.find({ userId: user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      user,
      applications: userApplications,
      payments: userPayments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user details',
      error: error.message
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, phone, isActive, role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, isActive, role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.info(`User updated by admin: ${user.email}`, { updatedBy: req.user.id });

    res.json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.info(`User deactivated by admin: ${user.email}`);

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

exports.getAllApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, startDate, endDate } = req.query;

    const query = {};
    
    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      query.$or = [
        { applicationId: searchRegex },
        { passNumber: searchRegex }
      ];
    }

    const applications = await PassApplication.find(query)
      .populate('userId', 'name email phone')
      .populate('routeId', 'routeNumber source destination')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await PassApplication.countDocuments(query);

    res.json({
      success: true,
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
};

exports.exportApplications = async (req, res) => {
  try {
    const { status, startDate, endDate, format = 'csv' } = req.query;

    const query = {};
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const applications = await PassApplication.find(query)
      .populate('userId', 'name email phone')
      .populate('routeId', 'routeNumber source destination')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      const csvHeaders = 'Application ID,Pass Number,Name,Email,Phone,Route,Status,Amount,Applied Date,Start Date,End Date\n';
      const csvData = applications.map(app => 
        `${app.applicationId},${app.passNumber || 'N/A'},${app.userId.name},${app.userId.email},${app.userId.phone},${app.routeId.routeNumber},${app.status},${app.totalAmount},${app.createdAt.toISOString()},${app.startDate.toISOString()},${app.endDate.toISOString()}`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=applications_${Date.now()}.csv`);
      res.send(csvHeaders + csvData);
    } else {
      res.json({
        success: true,
        data: applications,
        count: applications.length
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error exporting data',
      error: error.message
    });
  }
};

exports.getReports = async (req, res) => {
  try {
    const { type = 'monthly', year, month } = req.query;
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || new Date().getMonth() + 1;

    let startDate, endDate;
    
    if (type === 'daily') {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0);
    } else if (type === 'monthly') {
      startDate = new Date(currentYear, 0, 1);
      endDate = new Date(currentYear, 11, 31);
    } else if (type === 'yearly') {
      startDate = new Date(currentYear - 5, 0, 1);
      endDate = new Date(currentYear, 11, 31);
    }

    const applications = await PassApplication.find({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const payments = await Payment.find({
      createdAt: { $gte: startDate, $lte: endDate },
      paymentStatus: 'success'
    });

    const report = {
      totalApplications: applications.length,
      approved: applications.filter(a => a.status === 'approved').length,
      rejected: applications.filter(a => a.status === 'rejected').length,
      pending: applications.filter(a => a.status === 'pending').length,
      totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
      averageApplicationValue: applications.length > 0 
        ? Math.round(applications.reduce((sum, a) => sum + a.totalAmount, 0) / applications.length)
        : 0,
      topRoutes: await getTopRoutes(applications),
      period: { type, startDate, endDate }
    };

    res.json({
      success: true,
      report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating report',
      error: error.message
    });
  }
};

async function getTopRoutes(applications) {
  const routeCounts = {};
  
  applications.forEach(app => {
    const routeId = app.routeId.toString();
    routeCounts[routeId] = (routeCounts[routeId] || 0) + 1;
  });

  const sorted = Object.entries(routeCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const topRoutes = await Route.find({
    _id: { $in: sorted.map(([id]) => id) }
  });

  return topRoutes.map(route => ({
    route: route.routeNumber,
    source: route.source,
    destination: route.destination,
    count: routeCounts[route._id.toString()]
  }));
}

exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    const admin = await User.create({
      name,
      email,
      password,
      phone,
      role: 'admin'
    });

    logger.info(`Admin created: ${admin.email}`, { createdBy: req.user.id });

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating admin',
      error: error.message
    });
  }
};
