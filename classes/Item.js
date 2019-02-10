/**
 * Item class.
 * @class
 * @name Item
 * @property {number} this.id
 * @property {string} this.type
 * @property {string} this.name
 * @property {array} this.title
 * @property {number} this.damage
 * @property {number} this.max_damage
 * @property {boolean} this.inventory
 * @property {boolean} this.worn
 */
module.exports = class Item {
  constructor(data = {}) {
    const defaultParameters = {
      type: 'item',
    };
    data = {
      ...defaultParameters,
      ...data,
    };
    if (!('name' in data)) throw Error();
    if (!('title' in data)) data.title = data.name;
    for (const key in data) {
      if (!data.hasOwnProperty(key)) continue;
      this[key] = data[key];
    }
  }

  /**
   * Get inventory item method.
   * @param {number} id
   * @returns {Promise<module.Item>}
   */
  static async getInventoryItem(id) {
    const rawItem = await DB.db('wintercord')
      .collection('inventoryItems')
      .find({ id })
      .toArray();
    if (!rawItem.length) throw Error();
    const data = await DB.db('wintercord')
      .collection('items')
      .find({ name: rawItem[0].name })
      .toArray();
    if (!data.length) throw Error();
    return new Item({ ...data[0], ...rawItem[0], inventory: true });
  }

  /**
   * Get item method.
   * @param {string} name
   * @returns {Promise<module.Item>}
   */
  static async getItem(name) {
    const item = await DB.db('wintercord')
      .collection('items')
      .find({ name })
      .toArray();
    if (!item.length) throw Error();
    return new Item({ ...item[0], inventory: false });
  }

  async toInventoryItem(data = {}) {
    if (this.inventory) return this.id;
    const oldID = await DB.db('wintercord')
      .collection('inventoryItems')
      .find({}, { sort: [['id', 'desc']] })
      .toArray();
    const newID = oldID[0].id + 1;
    let defaultParameters = {
      name: this.name,
      id: newID,
    };
    switch (this.type) {
      case 'armor':
        defaultParameters = {
          ...defaultParameters,
          damage: this.max_damage,
        };
        break;
      case 'item':
      default:
    }
    await DB.db('wintercord')
      .collection('inventoryItems')
      .insertOne({
        ...defaultParameters,
        ...data,
      });
  }

  async transferTo(user) {
    if (!this.inventory) throw Error();
    await DB.db('wintercord')
      .collection('inventoryItems')
      .updateOne({ id: this.id }, { $set: { user } });
  }

  toString() {
    console.log(this);
    if (!this.inventory) return this.title;
    switch (this.type) {
      case 'armor':
        return `${this.title} (${this.damage}/${this.max_damage}\\🛡️) *(id: \`${this.id}\`)*`;
      case 'item':
      default:
        return `${this.title} *(id: \`${this.id}\`)*`;
    }
  }
};
