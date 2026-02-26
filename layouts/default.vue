<template>
  <div class="layout-container">
    <!-- Desktop Header -->
    <header class="app-header desktop-only glass">
      <div class="container header-content">
        <div class="logo">
          <Icon name="mdi:cards-playing" class="logo-icon" />
          <h1>MTG Commander</h1>
        </div>
        <nav class="desktop-nav">
          <NuxtLink to="/" class="nav-link">Dashboard</NuxtLink>
          <NuxtLink to="/players" class="nav-link">Players</NuxtLink>
          <NuxtLink to="/decks" class="nav-link">Decks</NuxtLink>
          <NuxtLink to="/games" class="nav-link">Games</NuxtLink>
          <button class="btn btn-secondary btn-sm ml-4" @click="signOut">
            <Icon name="mdi:logout" class="mr-1" /> Sign Out
          </button>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <div class="container">
        <slot />
      </div>
    </main>

    <!-- Mobile Bottom Navigation -->
    <nav class="bottom-nav mobile-only glass">
      <NuxtLink to="/" class="bottom-nav-item" active-class="active">
        <Icon name="mdi:view-dashboard" class="nav-icon" />
        <span>Home</span>
      </NuxtLink>
      <NuxtLink to="/players" class="bottom-nav-item" active-class="active">
        <Icon name="mdi:account-group" class="nav-icon" />
        <span>Players</span>
      </NuxtLink>
      <NuxtLink to="/decks" class="bottom-nav-item" active-class="active">
        <Icon name="mdi:cards" class="nav-icon" />
        <span>Decks</span>
      </NuxtLink>
      <NuxtLink to="/games" class="bottom-nav-item" active-class="active">
        <Icon name="mdi:sword-cross" class="nav-icon" />
        <span>Games</span>
      </NuxtLink>
      <button class="bottom-nav-item" @click="signOut">
        <Icon name="mdi:logout" class="nav-icon" />
        <span>Sign Out</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
const supabase = useSupabaseClient()
const router = useRouter()

const signOut = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}
</script>

<style scoped>
.layout-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Header Styles */
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid var(--border-color);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-height);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-primary);
}

.logo-icon {
  font-size: 1.5rem;
  color: var(--accent-primary);
}

.logo h1 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.025em;
}

.desktop-nav {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.95rem;
  padding: 0.5rem 0;
  position: relative;
}

.nav-link:hover {
  color: var(--text-primary);
}

.nav-link.router-link-active {
  color: var(--accent-primary);
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--accent-primary);
  border-radius: 2px;
}

/* Main Content Styles */
.main-content {
  flex: 1;
  padding: 1.5rem 0;
}

@media (min-width: 768px) {
  .main-content {
    padding: 2.5rem 0;
  }
}

/* Bottom Nav Styles */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--nav-height);
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid var(--border-color);
  z-index: 50;
  padding-bottom: env(safe-area-inset-bottom);
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  color: var(--text-secondary);
  width: 100%;
  height: 100%;
  text-decoration: none;
  transition: color 0.2s ease;
}

.nav-icon {
  font-size: 1.5rem;
}

.bottom-nav-item span {
  font-size: 0.7rem;
  font-weight: 500;
}

.bottom-nav-item.active {
  color: var(--accent-primary);
}
</style>
