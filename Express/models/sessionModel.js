const { models } = require("./index");
const { Op } = require("sequelize");

module.exports = {
    createSession: async (sessionId, userId, token) => {
        // console.log(userId);
        try {
            const session = await models.Sessions.create({
                sessionId: sessionId,
                userId: userId,
                token: token,
            });
            return {
                response: session,
            };


        } catch (error) {
            return {
                error: error,
            };
        }

    },
    getSessionByUserId: async (userId) => {
        try {
            const session = await models.Sessions.findOne({
                where: {
                    userId: userId,
                }
            })
            return {
                response: session,
            };


        } catch (error) {
            return {
                error: error,
            };
        }

    },
    getSession: async (userId, token) => {
        try {
            const session = await models.Sessions.findOne({

                where: {
                    userId: userId,
                    token: token
                }


            })
            return {
                response: session,
            };


        } catch (error) {
            return {
                error: error,
            };
        }

    },
    deleteSession: async (userId) => {
        try {
            const session = await models.Sessions.destroy({
                where: {
                    userId: userId,
                }
            })
            return {
                response: session,
            };


        } catch (error) {
            return {
                error: error,
            };
        }

    },

};