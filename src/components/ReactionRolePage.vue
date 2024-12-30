<template>
  <div class="reaction-role-page">
    <NavigationBar />
    <div class="config-container">
      <Sidebar @option-selected="" />
      <main class="main-content">
        <section class="config-section">
          <h2>Reaction Role Settings</h2>
          <form @submit.prevent="saveReactionRoleSettings" class="form">
            <div class="form-group">
              <label for="channel-select">Channel:</label>
              <select id="channel-select" v-model="reactionRole.channelId" class="form-select">
                <option v-if="textChannels.length === 0" disabled>No text channels available</option>
                <option v-for="channel in textChannels" :key="channel.id" :value="channel.id">{{ channel.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label for="message-id">Message ID:</label>
              <input type="text" id="message-id" v-model="reactionRole.messageId" class="form-input" />
            </div>
            <div class="form-group">
              <label for="emoji-select">Emoji:</label>
              <select id="emoji-select" v-model="reactionRole.emoji" class="form-select">
                <option v-if="emojis.length === 0" disabled>No emojis available</option>
                <option v-for="emoji in emojis" :key="emoji.id" :value="emoji.id">{{ emoji.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label for="role-select">Role:</label>
              <select id="role-select" v-model="reactionRole.roleId" class="form-select">
                <option v-if="roles.length === 0" disabled>No roles available</option>
                <option v-for="role in roles" :key="role.id" :value="role.id">
                  {{ role.name || 'Unnamed Role' }}
                </option>
              </select>
            </div>
            <button type="submit" class="save-button">Save</button>
          </form>
          <div class="preview">
            <h3>Current Settings</h3>
            <ul class="reaction-roles-list">
              <li v-for="(role, index) in previewConfig.reactionRoles" :key="index" class="reaction-role-item">
                <button @click="deleteReactionRole(role)" class="delete-button">Delete</button>
                <span>
                  Channel: {{ role.channel || 'N/A' }},
                  Message ID: {{ role.messageId || 'N/A' }},
                  Emoji:
                  <span v-if="isUrl(role.emoji)">
                    <img :src="role.emoji" alt="emoji" class="emoji-image" />
                  </span>
                  <span v-else>{{ role.emoji || 'N/A' }}</span>,
                  Role: {{ role.role || 'N/A' }}
                </span>
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script>
import Sidebar from "@/components/Sidebar.vue";
import NavigationBar from "@/components/NavigationBar.vue";
import apiService from "@/services/apiService";

export default {
  components: { NavigationBar, Sidebar },
  data() {
    return {
      textChannels: [],
      emojis: [],
      roles: [],
      reactionRole: { channelId: "", messageId: "", emoji: "", roleId: "" },
      previewConfig: { reactionRoles: [] },
    };
  },
  async created() {
    await this.fetchServerData();
    await this.fetchPreviewConfig();
  },
  methods: {
    async fetchServerData() {
      const serverId = this.$route.params.serverId;
      try {
        const [channelsResponse, rolesResponse, emojisResponse] = await Promise.all([
          apiService.get(`/api/${serverId}/channels`),
          apiService.get(`/api/${serverId}/roles`),
          apiService.get(`/api/${serverId}/emojis`),
        ]);

        this.textChannels = channelsResponse.channels
          .filter(channel => channel.type === 0) // Filter text channels
          .map(channel => ({
            id: channel.id,
            name: channel.name,
          }));

        this.roles = rolesResponse.data
          .map(role => ({
            id: role.id,
            name: role.name || 'Unnamed Role', // Ensure role name is valid
          }));

        this.emojis = emojisResponse.data;
      } catch (error) {
        console.error("Error fetching server data:", error);
      }
    },
    async fetchPreviewConfig() {
      const serverId = this.$route.params.serverId;
      try {
        const response = await apiService.get(`/api/${serverId}/reaction-roles`);
        // 格式化數據
        this.previewConfig.reactionRoles = response.data.map((item) => ({
          channel: this.textChannels.find(ch => ch.id === item.channel_id)?.name || 'Unknown Channel',
          messageId: item.message_id,
          emoji: this.emojis.find(e => e.id === item.emoji)?.name || item.emoji,
          role: this.roles.find(r => r.id === item.role_id)?.name || 'Unknown Role',
        }));
      } catch (error) {
        console.error("Failed to fetch preview configuration:", error);
      }
    },
    async saveReactionRoleSettings() {
      const serverId = this.$route.params.serverId;
      try {
        console.log("Saving Reaction Role:", this.reactionRole);
        await apiService.post(`/api/${serverId}/reaction-roles`, this.reactionRole);
        alert("Reaction Role saved successfully!");
        this.fetchPreviewConfig();
      } catch (error) {
        console.error("Failed to save Reaction Role:", error);
      }
    },
    async deleteReactionRole(role) {
      const serverId = this.$route.params.serverId;
      const emojiId = this.emojis.find(e => e.name === role.emoji)?.id;
      try {
      await apiService.delete(`/api/${serverId}/reaction-roles`, {
        messageId: role.messageId,
        emoji: emojiId,
      });
      alert("Reaction Role deleted successfully!");
      this.fetchPreviewConfig();
      } catch (error) {
      console.error("Failed to delete Reaction Role:", error);
      }
    },
    isUrl(emoji) {
      return emoji.startsWith("http");
    },
  },
};
</script>

<style scoped>
.reaction-role-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #7289da, #4b2c5e);
  color: #ffffff;
}

.config-container {
  display: flex;
  flex: 1;
}

.sidebar {
  width: 250px; /* 增加 Sidebar 寬度 */
  background-color: #2e3136; /* 添加透明背景效果 */
  padding: 20px;
}

.main-content {
  flex: 1;
  padding: 20px;
}

.form {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-select,
.form-input {
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  background-color: rgba(255, 255, 255, 0.9);
  color: #000000;
  font-size: 16px;
}

.form-select:focus,
.form-input:focus {
  border-color: #7289da;
}

.save-button {
  background-color: #7289da;
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.3s ease-in-out;
}

.save-button:hover {
  background-color: #5a6bb7;
}

.preview {
  margin-top: 20px;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 8px;
}

.reaction-role-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: rgba(46, 49, 54, 0.8);
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 10px;
}

.delete-button {
  background-color: #ff4757;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  padding: 5px 15px;
  cursor: pointer;
  transition: background-color 0.3s ease-in-out;
}

.delete-button:hover {
  background-color: #e04a4a;
}

.reaction-roles-list {
  list-style: none; /* 移除預設列表樣式 */
  padding: 0;
  margin: 0;
}

.reaction-role-item {
  background-color: rgba(255, 255, 255, 0.1); /* 背景透明感 */
  color: #ffffff; /* 白色文字 */
  border-radius: 6px; /* 圓角 */
  padding: 10px; /* 內部間距 */
  margin-bottom: 5px; /* 項目之間的間距 */
  display: flex; /* 使用彈性盒模型 */
  align-items: center; /* 確保文字和按鈕垂直居中 */
  gap: 10px; /* 控制按鈕與文字之間的距離 */
}

.reaction-role-item > span {
  flex: 1; /* 占據剩餘空間，讓文字部分撐開 */
  text-align: left; /* 左對齊文字 */
  white-space: nowrap; /* 防止換行 */
  overflow: hidden; /* 超出隱藏 */
  text-overflow: ellipsis; /* 超出部分顯示省略號 */
}

.reaction-role-item > button.delete-button {
  background-color: #ff4757; /* 刪除按鈕顏色 */
  color: #ffffff;
  border: none;
  border-radius: 6px; /* 圓角按鈕 */
  padding: 6px 12px; /* 控制按鈕內部間距 */
  font-size: 14px; /* 調整按鈕文字大小 */
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex; /* 確保按鈕內文字垂直居中 */
  align-items: center; /* 垂直居中按鈕文字 */
}

.reaction-role-item > button.delete-button:hover {
  background-color: #e03e4f; /* 鼠標懸停顏色 */
}
</style>