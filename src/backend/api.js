'use strict';

module.exports = (database, ee) => ({
  users: {
    create: async ({ id }) => {
      const user = await database('users').where({ id }).first();
      if (user !== undefined) {
        return { success: false, data: 'User already exists!' };
      }
      await database.insert({ id }).into('users');
      return { success: true, data: { id } };
    },
  },

  messages: {
    get: async () => ({
      success: true,
      data: await database('messages').orderBy('createdAt'),
    }),

    create: async ({ userId, message }) => {
      const user = await database('users').where({ id: userId }).first();
      if (user === undefined) {
        return { success: false, data: 'User does not exist!' };
      }
      const data = await database('messages').insert({ userId, message }, '*');
      ee.emit('message', data[0]);
      return { success: true, data: data[0] };
    },
  },
});
