const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../bin/dbConnection");

class Tasks extends Model { }
Tasks.init({
    taskId: {
        primaryKey: true,
        type: DataTypes.STRING(60),
    },
    title: {
        type: DataTypes.STRING(60),
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.STRING(60),
        allowNull: false,
    },

},
    {
        sequelize,
        timestamps: true,
        paranoid: true,
        modelName: "tasks"

    });

module.exports = Tasks;




