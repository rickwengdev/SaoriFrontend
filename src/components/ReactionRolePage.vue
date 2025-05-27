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
.reaction-role-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(to bottom right, #3f3cbb, #4a00e0);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.config-container {
  display: flex;
  flex: 1;
  min-height: 100%;
}

/* Sidebar */
.sidebar {
  width: 250px;
  background-color: #2e3136;
  padding: 20px;
  transition: transform 0.3s ease;
  transform: translateX(0);
}

.sidebar.hidden {
  transform: translateX(-100%);
}

/* Sidebar navigation items */
.sidebar nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar nav ul li {
  margin: 20px 0;
}

.sidebar nav ul li a {
  text-decoration: none;
  color: white;
  display: block;
  padding: 10px;
  border-radius: 25px;
  transition: background-color 0.3s;
}

.sidebar nav ul li a.active,
.sidebar nav ul li a:hover {
  background-color: #7289da;
}

/* Main content */
.main-content {
  flex: 1;
  padding: 40px;
  background: linear-gradient(to bottom right, #4b0082, #8a2be2);
  color: white;
  transition: margin-left 0.3s ease;
}

/* Toggle button */
.sidebar-toggle {
  position: absolute;
  top: 20px;
  left: 20px;
  background-color: #2e3136;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  color: white;
  display: none; /* 顯示在小螢幕 */
}

/* Profile avatar */
.profile-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

/* Settings section */
.settings-section {
  margin-bottom: 30px;
}

.settings-section label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}

.settings-section select,
.settings-section input {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: none;
  margin-bottom: 15px;
}

.settings-section button {
  padding: 10px 20px;
  border: none;
  background-color: #7289da;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.settings-section button:hover {
  background-color: #5b6eae;
}

/* Responsive Design */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    z-index: 100;
    transform: translateX(-100%);
  }

  .sidebar:not(.hidden) {
    transform: translateX(0);
  }

  .sidebar-toggle {
    display: block;
    z-index: 200;
  }

  .main-content {
    padding: 20px;
  }

  .config-container {
    flex-direction: column;
  }
}
</style>