export const useDb = () => {
  const supabase = useSupabaseClient()
  
  return {
    async getPlayers() {
      const { data, error } = await supabase.from('players').select('*').order('name')
      if (error) console.error(error)
      return data || []
    },
    
    async addPlayer(name: string) {
      const { data, error } = await supabase.from('players').insert([{ name }]).select()
      if (error) throw error
      return data[0]
    },
    
    async getDecks() {
      const { data, error } = await supabase.from('decks').select(`
        *,
        players ( name )
      `).order('created_at', { ascending: false })
      if (error) console.error(error)
      return data || []
    },
    
    async addDeck(playerId: string, commanderName: string, commanderImageUrl: string) {
      const { data, error } = await supabase.from('decks').insert([{
        player_id: playerId,
        commander_name: commanderName,
        commander_image_url: commanderImageUrl
      }]).select()
      if (error) throw error
      return data[0]
    },
    
    async getGames() {
      const { data, error } = await supabase.from('games').select(`
        *,
        players!games_winner_id_fkey ( name )
      `).order('played_on', { ascending: false })
      if (error) console.error(error)
      return data || []
    }
  }
}
