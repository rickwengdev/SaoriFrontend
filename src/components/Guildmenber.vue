<template>
    <div class="container">
        <NavigationBar />
        <div class="config-container">
            <Sidebar @option-selected="" />
            <main class="main-content">
                <section v-if="currentSection === 'welcome'" class="config-section">
                    <h2>Welcome Message Settings</h2>
                    <form @submit.prevent="saveWelcomeLeaveSettings" class="form">
                        <div class="form-group">
                            <label for="welcome-channel">Welcome Channel:</label>
                            <select id="welcome-channel" v-model="welcomeChannel" class="form-select">
                                <option v-if="textChannels.length === 0" disabled>No text channels available</option>
                                <option v-for="channel in textChannels" :key="channel.id" :value="channel.id">{{ channel.name }}</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="leave-channel">Leave Channel:</label>
                            <select id="leave-channel" v-model="leaveChannel" class="form-select">
                                <option v-if="textChannels.length === 0" disabled>No text channels available</option>
                                <option v-for="channel in textChannels" :key="channel.id" :value="channel.id">{{ channel.name }}</option>
                            </select>
                        </div>
                        <button type="submit" class="save-button">Save</button>
                    </form>
                    <div class="preview">
                        <h3>Current Settings</h3>
                        <p>Welcome Channel: {{ preview.welcomeChannel || 'N/A' }}</p>
                        <p>Leave Channel: {{ preview.leaveChannel || 'N/A' }}</p>
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
    components: { Sidebar, NavigationBar },
    data() {
        return {
            currentSection: "welcome",
            textChannels: [],
            welcomeChannel: null,
            leaveChannel: null,
            preview: {
                welcomeChannel: null,
                leaveChannel: null,
            },
            loading: true,
        };
    },
    async created() {
        await this.fetchData();
    },
    methods: {
        async fetchData() {
            const serverId = this.$route.params.serverId;
            try {
                const channelsResponse = await apiService.get(`/api/${serverId}/channels`);

                const channels = channelsResponse.channels || [];

                this.textChannels = channels
                    .filter(channel => channel.type === 0) // Filter text channels
                    .map(channel => ({
                        id: channel.id,
                        name: channel.name,
                    })
                );

                const previewResponse = await apiService.get(`/api/${serverId}/getWelcomeLeave`);
                const config = previewResponse.config || {};

                this.preview = {
                    welcomeChannel: this.getChannelName(config.welcome_channel_id),
                    leaveChannel: this.getChannelName(config.leave_channel_id),
                };

                this.welcomeChannel = config.welcome_channel_id || null;
                this.leaveChannel = config.leave_channel_id || null;
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                this.loading = false;
            }
        },
        // 保存歡迎與離開設置
        async saveWelcomeLeaveSettings() {
            const serverId = this.$route.params.serverId;

            try {
                await apiService.post(`/api/${serverId}/updateWelcomeLeave`, {
                    welcomeChannelId: this.welcomeChannel,
                    leaveChannelId: this.leaveChannel,
                });
                alert("Settings saved successfully!");
                await this.fetchData(); // 更新預覽設置
            } catch (error) {
                console.error("Error saving settings:", error);
            }
        },
        getChannelName(channelId) {
            const channel = this.textChannels.find(channel => channel.id === channelId);
            return channel ? channel.name : 'N/A';
        },
    },
};
</script>

<style scoped>
.container {
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
    width: 250px;
    background-color: #2e3136;
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

.form-select {
    width: 100%;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
    font-size: 16px;
}

.save-button {
    background-color: #7289da;
    color: #fff;
    border: none;
    border-radius: 5px;
    padding: 10px 20px;
    cursor: pointer;
}

.save-button:hover {
    background-color: #5a6bb7;
}

.preview {
    background-color: rgba(255, 255, 255, 0.1);
    padding: 20px;
    border-radius: 8px;
}

h2 {
    margin-bottom: 20px;
    color: #ffffff;
}
</style>