import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/sequelize.js";
import Constants from "../../config/constants.js";

class TaskModel extends Model {}

TaskModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(Constants.taskStatus)),
      allowNull: false,
      defaultValue: Constants.taskStatus.PENDING_APPROVAL,
    },
    createdById: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "created_by_id",
    },
    assignedToId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "assigned_to_id",
    },
    approvedById: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "approved_by_id",
    },
    rejectedById: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "rejected_by_id",
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "approved_at",
    },
    rejectedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "rejected_at",
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "started_at",
    },
    closedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "closed_at",
    },
  },
  {
    sequelize,
    modelName: "Task",
    tableName: "tasks",
    underscored: true,
    indexes: [
      { fields: ["created_by_id"] },
      { fields: ["assigned_to_id"] },
      { fields: ["status"] },
    ],
  }
);

export default TaskModel;

