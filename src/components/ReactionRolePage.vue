<template>
  <div class="reaction-role-page">
    <NavigationBar />
    <button @click="toggleSidebar" class="sidebar-toggle" v-if="isMobile">☰</button>
    <div class="config-container">
      <Sidebar @option-selected="" :class="{ hidden: isMobile && isSidebarHidden }" />
      <main class="main-content">
        <section class="config-section">
          <h2>Reaction Role Settings</h2>
          <form @submit.prevent="saveReactionRoleSettings" class="form">
            <div class="form-group">
              <label for="channel-select">Channel:</label>
              <select id="channel-select" v-model="reactionRole.channelId" class="form-select">
                <option v-if="textChannels.length === 0" disabled>No text channels available</option>
                <option v-for="channel in textChannels" :key="channel.id" :value="channel.id">
                  {{ channel.name }}
                </option>
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
                <option v-for="emoji in emojis" :key="emoji.id" :value="emoji.id">
                  {{ emoji.name }}
                </option>
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
      isSidebarHidden: false,
      isMobile: window.innerWidth <= 768,
    };
  },
  created() {
    window.addEventListener("resize", this.checkMobile);
    this.fetchServerData();
    this.fetchPreviewConfig();
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.checkMobile);
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
          .filter((channel) => channel.type === 0)
          .map((channel) => ({ id: channel.id, name: channel.name }));

        this.roles = rolesResponse.data.map((role) => ({
          id: role.id,
          name: role.name || "Unnamed Role",
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
        this.previewConfig.reactionRoles = response.data.map((item) => ({
          channel: this.textChannels.find((ch) => ch.id === item.channel_id)?.name || "Unknown Channel",
          messageId: item.message_id,
          emoji: this.emojis.find((e) => e.id === item.emoji)?.name || item.emoji,
          role: this.roles.find((r) => r.id === item.role_id)?.name || "Unknown Role",
        }));
      } catch (error) {
        console.error("Failed to fetch preview configuration:", error);
      }
    },
    async saveReactionRoleSettings() {
      const serverId = this.$route.params.serverId;
      try {
        await apiService.post(`/api/${serverId}/reaction-roles`, this.reactionRole);
        alert("Reaction Role saved successfully!");
        this.fetchPreviewConfig();
      } catch (error) {
        console.error("Failed to save Reaction Role:", error);
      }
    },
    async deleteReactionRole(role) {
      const serverId = this.$route.params.serverId;
      const emojiId = this.emojis.find((e) => e.name === role.emoji)?.id;
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
    checkMobile() {
      this.isMobile = window.innerWidth <= 768;
    },
    toggleSidebar() {
      if (this.isMobile) {
        this.isSidebarHidden = !this.isSidebarHidden;
      }
    },
    isUrl(emoji) {
      return emoji.startsWith("http");
    }
  },
  };
</script>

<style scoped>
.container,
.reaction-role-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #7289da, #4b2c5e);
  color: #ffffff;
}

/* Sidebar Toggle 按鈕 */
.sidebar-toggle {
  background: #2e3136;
  color: #ffffff;
  border: none;
  padding: 10px;
  font-size: 18px;
  cursor: pointer;
  position: fixed;
  top: 15px;
  right: 70px;
  z-index: 20;
  border-radius: 5px;
}

.config-container {
  display: flex;
  flex: 1;
  flex-direction: row;
}

.sidebar {
  width: 250px;
  background-color: #2e3136;
  padding: 20px;
  transition: transform 0.3s ease;
}

.sidebar.hidden {
  transform: translateX(-100%);
  visibility: hidden;
  position: absolute;
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
  outline: none;
}

.save-button {
  background-color: #7289da;
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  cursor: pointer;
  width: 100%;
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

.reaction-roles-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.reaction-role-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 5px;
}

.reaction-role-item > span {
  flex: 1;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.reaction-role-item > button.delete-button {
  background-color: #ff4757;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
}

.reaction-role-item > button.delete-button:hover {
  background-color: #e03e4f;
}

.emoji-image {
  height: 1.2em;
  vertical-align: middle;
}

h2 {
  margin-bottom: 20px;
  color: #ffffff;
}

/* RWD: 移動裝置 */
@media (max-width: 768px) {
  .config-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    padding: 10px;
  }

  .main-content {
    padding: 10px;
  }

  .reaction-role-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .reaction-role-item > span {
    white-space: normal;
    overflow: visible;
    text-overflow: unset;
  }

  .reaction-role-item > button.delete-button {
    align-self: flex-end;
    margin-top: 8px;
  }
}

/* 桌面版隱藏切換按鈕 */
@media (min-width: 769px) {
  .sidebar-toggle {
    display: none;
  }

  .sidebar {
    transform: none !important;
    visibility: visible !important;
    position: relative !important;
  }
}
</style>