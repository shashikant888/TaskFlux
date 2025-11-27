import { DataTypes, Model } from "sequelize";
import bcrypt from "bcryptjs";
import sequelize from "../../config/sequelize.js";
import Constants from "../../config/constants.js";
import DateUtils from '../../lib/date.utils.js';

class UserModel extends Model {
  async authenticate(password) {
    return bcrypt.compare(password, this.password);
  }

  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    values.createdAtText = DateUtils.changeTimezoneFromUtc(values.createdAt, Constants.TIME_ZONE, 'DD/MM/YYY hh:mm A');
    return values;
  }
}

UserModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 120],
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(...Object.values(Constants.roles)),
      allowNull: false,
    },
    managerId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    underscored: true,
    defaultScope: {
      attributes: { exclude: ["password"] },
    },
    scopes: {
      withPassword: {
        attributes: { include: ["password"] },
      },
    },
    indexes: [
      { unique: true, fields: ["email"] },
      { fields: ["role"] },
      { fields: ["manager_id"] },
    ],
  }
);

UserModel.addHook("beforeCreate", async (user) => {
  if (user.password) {
    user.password = await bcrypt.hash(
      user.password,
      Number(Constants.security.salt_rounds) || 12
    );
  }
});

UserModel.addHook("beforeUpdate", async (user) => {
  if (user.changed("password")) {
    user.password = await bcrypt.hash(
      user.password,
      Number(Constants.security.salt_rounds) || 12
    );
  }
});

export default UserModel;
