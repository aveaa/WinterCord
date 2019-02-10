const defaultParameters = {
  hp: 100,
  max_hp: 100,
  balance: 100,
  armor: {
    helmet: null,
    chestplate: null,
    leggings: null,
    boots: null,
  },
};

/**
 * User class.
 * @class
 * @name User
 * @property {number} this.hp
 * @property {number} this.protection
 * @property {number} this.maxProtection
 * @property {number} this.max_hp
 * @property {number} this.balance
 * @property {string} this.id
 * @property {array} this.fetchedItems
 * @property {{helmet: null|Item, chestplate: null|Item, leggings: null|Item, boots: null|Item}} this.armor
 */
module.exports = class User {
  constructor(data = {}) {
    data = {
      ...defaultParameters,
      ...data,
    };

    for (const key in data) {
      if (!data.hasOwnProperty(key)) continue;
      this[key] = data[key];
    }
  }

  /**
   * Get user method.
   * @param id
   * @returns {Promise<module.User>}
   */
  static async getUser(id) {
    let data = await DB.db('wintercord').collection('users').find({ id }).toArray();
    if (!data.length) {
      await DB.db('wintercord').collection('users').insertOne({ ...defaultParameters, id });
      data = await DB.db('wintercord').collection('users').find({ id }).toArray();
    }
    return new User(data[0]);
  }

  async update() {
    let data = await DB.db('wintercord').collection('users').find({ id: this.id }).toArray();
    if (!data.length) {
      await DB.db('wintercord').collection('users').insertOne({ ...defaultParameters, id: this.id });
      data = await DB.db('wintercord').collection('users').find({ id: this.id }).toArray();
    }
    data = {
      ...defaultParameters,
      ...data,
    };

    for (const key in data) {
      if (!data.hasOwnProperty(key)) continue;
      this[key] = data[key];
    }
  }

  async fetchItems() {
    const itemsRaw = await DB.db('wintercord')
      .collection('inventoryItems')
      .find({ user: this.id }, { sort: [['id', 'asc']] })
      .toArray();
    if (!itemsRaw.length) {
      this.fetchedItems = [];
      return this.fetchedItems;
    }
    const queryObject = { $or: [] };
    itemsRaw.forEach((item) => {
      queryObject.$or.push({ name: item.name });
    });
    const fetchedItemsRaw = await DB.db('wintercord')
      .collection('items')
      .find(queryObject)
      .toArray();
    this.fetchedItems = [];
    itemsRaw.forEach((itemData) => {
      const args = { ...itemData, ...fetchedItemsRaw.find(i => i.name === itemData.name) };
      if ('worn' in args && args.worn) return;
      this.fetchedItems.push(new Item({ ...args, inventory: true }));
    });
    return this.fetchedItems;
  }

  /**
   * Fetch armor method.
   // * @param {'helmet'|'chestplate'|'leggings'|'boots'} piece
   * @returns {Promise<void>}
   */
  async fetchArmor() {
    this.fetchedArmor = {};
    this.maxProtection = 0;
    this.protection = 0;
    for (const piece in this.armor) {
      if (!this.armor.hasOwnProperty(piece)) continue;
      if (this.armor[piece] == null) {
        this.fetchedArmor[piece] = null;
        continue;
      }
      // eslint-disable-next-line no-await-in-loop
      this.fetchedArmor[piece] = await Item.getInventoryItem(this.armor[piece]);
      this.maxProtection += this.fetchedArmor[piece].max_damage;
      this.protection += this.fetchedArmor[piece].damage;
      if (!this.fetchedArmor[piece].worn) this.fetchedArmor[piece] = null;
    }
    return this.fetchedArmor;
  }

  async addMoney(count) {
    const oldBalance = this.balance;
    const newBalance = this.balance + count;
    await DB.db('wintercord')
      .collection('users')
      .updateOne({ id: this.id }, { $set: { balance: newBalance } });
    await this.update();
    return {
      oldBalance,
      newBalance,
      added: count,
    };
  }

  async removeMoney(count) {
    const oldBalance = this.balance;
    const newBalance = this.balance - count;
    await DB.db('wintercord')
      .collection('users')
      .updateOne({ id: this.id }, { $set: { balance: newBalance } });
    await this.update();
    return {
      oldBalance,
      newBalance,
      removed: count,
    };
  }

  /**
   * Add item method
   * @param item
   * @returns {Promise<void>}
   */
  async addItem(item) {
    const itemObject = await Item.getItem(item);
    await itemObject.toInventoryItem({
      user: this.id,
    });
  }
};
