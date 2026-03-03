const toPublicUser = (user) => {
  if (!user) return user;

  const { password, ...safeUser } = user;
  return {
    ...safeUser,
    _id: safeUser.id,
    userType: normalizeUserType(safeUser.userType)
  };
};

const withMongoId = (value) => {
  if (Array.isArray(value)) {
    return value.map(withMongoId);
  }

  if (value && typeof value === 'object') {
    const mapped = {};
    Object.keys(value).forEach((key) => {
      mapped[key] = withMongoId(value[key]);
    });

    if (mapped.id && !mapped._id) {
      mapped._id = mapped.id;
    }

    return mapped;
  }

  return value;
};

const normalizeUserType = (userType) => {
  if (!userType) return 'customer';

  const normalized = String(userType).toLowerCase().replace(/_/g, '-');

  if (normalized === 'shopowner') return 'shop-owner';
  if (normalized === 'owner') return 'shop-owner';

  if (['customer', 'shop-owner', 'admin'].includes(normalized)) {
    return normalized;
  }

  return 'customer';
};

module.exports = {
  toPublicUser,
  normalizeUserType,
  withMongoId
};
