<template>
  <aside class="sidebar">
    <ul class="sidebar-menu">
      <li
        v-for="option in menuOptions"
        :key="option.name"
        :class="['sidebar-option', { active: $route.name === option.name }]"
        @click="navigateTo(option.name)"
      >
        {{ option.label }}
      </li>
    </ul>
  </aside>
</template>

<script>
export default {
  data() {
    return {
      menuOptions: [
        { name: 'guildmenber', label: 'Welcome Messages' },
        { name: 'reactionrole', label: 'Reaction Roles' },
        { name: 'dynamicvoicechannel', label: 'Dynamic Voice Channels' },
        { name: 'logchannel', label: 'Log Settings' },
      ],
    };
  },
  methods: {
    navigateTo(routeName) {
      this.$router.push({ name: routeName });
    },
  },
};
</script>
  
<style scoped>
  .sidebar {
    width: 250px;
    background-color: #2e3136;
    padding-top: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .sidebar-menu {
    list-style: none;
    padding: 0;
    width: 100%;
  }
  .sidebar-option {
    width: 90%;
    padding: 12px;
    margin: 8px auto;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #c5c5c5;
    cursor: pointer;
    transition: background-color 0.3s, color 0.3s;
  }
  .sidebar-option:hover {
    background-color: #40444b;
    color: #ffffff;
  }
  .sidebar-option.active {
    background-color: #7289da;
    color: #ffffff;
  }
</style>