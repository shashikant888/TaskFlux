import UserModel from "../services/user/user.model.js";
import TaskModel from "../services/task/task.model.js";

let associationsRegistered = false;

export const initModels = () => {
  if (associationsRegistered) return;

  UserModel.hasMany(TaskModel, {
    as: "createdTasks",
    foreignKey: "createdById",
    sourceKey: "id",
    onDelete: "CASCADE",
  });

  UserModel.hasMany(TaskModel, {
    as: "assignedTasks",
    foreignKey: "assignedToId",
    sourceKey: "id",
    onDelete: "CASCADE",
  });

  UserModel.hasMany(UserModel, {
    as: "teamMembers",
    foreignKey: "managerId",
  });

  UserModel.belongsTo(UserModel, {
    as: "manager",
    foreignKey: "managerId",
  });

  TaskModel.belongsTo(UserModel, {
    as: "createdBy",
    foreignKey: "createdById",
  });

  TaskModel.belongsTo(UserModel, {
    as: "assignedTo",
    foreignKey: "assignedToId",
  });

  TaskModel.belongsTo(UserModel, {
    as: "approvedBy",
    foreignKey: "approvedById",
  });

  TaskModel.belongsTo(UserModel, {
    as: "rejectedBy",
    foreignKey: "rejectedById",
  });

  associationsRegistered = true;
};

export { UserModel, TaskModel };

