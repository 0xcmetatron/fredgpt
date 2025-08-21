interface TokenConfig {
  email: string
  userId: string | null
  validated: string
  lastUsed: number
  requestCount: number
  isExhausted: boolean
  exhaustedUntil: number
}

class TokenRotationManager {
  private tokens: TokenConfig[] = [
    {
      email: "alexsmith2024@gmail.com",
      userId: null,
      validated: "a38f5889-8fef-46d4-8ede-bf4668b6a9bb",
      lastUsed: 0,
      requestCount: 0,
      isExhausted: false,
      exhaustedUntil: 0,
    },
    {
      email: "mariagarcia2024@gmail.com",
      userId: null,
      validated: "a38f5889-8fef-46d4-8ede-bf4668b6a9bb",
      lastUsed: 0,
      requestCount: 0,
      isExhausted: false,
      exhaustedUntil: 0,
    },
    {
      email: "johnwilson2024@gmail.com",
      userId: null,
      validated: "a38f5889-8fef-46d4-8ede-bf4668b6a9bb",
      lastUsed: 0,
      requestCount: 0,
      isExhausted: false,
      exhaustedUntil: 0,
    },
    {
      email: "sarahbrown2024@gmail.com",
      userId: null,
      validated: "a38f5889-8fef-46d4-8ede-bf4668b6a9bb",
      lastUsed: 0,
      requestCount: 0,
      isExhausted: false,
      exhaustedUntil: 0,
    },
    {
      email: "davidjones2024@gmail.com",
      userId: null,
      validated: "a38f5889-8fef-46d4-8ede-bf4668b6a9bb",
      lastUsed: 0,
      requestCount: 0,
      isExhausted: false,
      exhaustedUntil: 0,
    },
    {
      email: "emilydavis2024@gmail.com",
      userId: null,
      validated: "a38f5889-8fef-46d4-8ede-bf4668b6a9bb",
      lastUsed: 0,
      requestCount: 0,
      isExhausted: false,
      exhaustedUntil: 0,
    },
    {
      email: "michaelmiller2024@gmail.com",
      userId: null,
      validated: "a38f5889-8fef-46d4-8ede-bf4668b6a9bb",
      lastUsed: 0,
      requestCount: 0,
      isExhausted: false,
      exhaustedUntil: 0,
    },
    {
      email: "jessicamoore2024@gmail.com",
      userId: null,
      validated: "a38f5889-8fef-46d4-8ede-bf4668b6a9bb",
      lastUsed: 0,
      requestCount: 0,
      isExhausted: false,
      exhaustedUntil: 0,
    },
    {
      email: "christaylor2024@gmail.com",
      userId: null,
      validated: "a38f5889-8fef-46d4-8ede-bf4668b6a9bb",
      lastUsed: 0,
      requestCount: 0,
      isExhausted: false,
      exhaustedUntil: 0,
    },
    {
      email: "ashleyanderson2024@gmail.com",
      userId: null,
      validated: "a38f5889-8fef-46d4-8ede-bf4668b6a9bb",
      lastUsed: 0,
      requestCount: 0,
      isExhausted: false,
      exhaustedUntil: 0,
    },
    {
      email: "matthewthomas2024@gmail.com",
      userId: null,
      validated: "a38f5889-8fef-46d4-8ede-bf4668b6a9bb",
      lastUsed: 0,
      requestCount: 0,
      isExhausted: false,
      exhaustedUntil: 0,
    },
    {
      email: "amandajackson2024@gmail.com",
      userId: null,
      validated: "a38f5889-8fef-46d4-8ede-bf4668b6a9bb",
      lastUsed: 0,
      requestCount: 0,
      isExhausted: false,
      exhaustedUntil: 0,
    },
    {
      email: "jameswhite2024@gmail.com",
      userId: null,
      validated: "a38f5889-8fef-46d4-8ede-bf4668b6a9bb",
      lastUsed: 0,
      requestCount: 0,
      isExhausted: false,
      exhaustedUntil: 0,
    },
    {
      email: "laurenharris2024@gmail.com",
      userId: null,
      validated: "a38f5889-8fef-46d4-8ede-bf4668b6a9bb",
      lastUsed: 0,
      requestCount: 0,
      isExhausted: false,
      exhaustedUntil: 0,
    },
    {
      email: "ryanmartin2024@gmail.com",
      userId: null,
      validated: "a38f5889-8fef-46d4-8ede-bf4668b6a9bb",
      lastUsed: 0,
      requestCount: 0,
      isExhausted: false,
      exhaustedUntil: 0,
    },
    {
      email: "nicolethompson2024@gmail.com",
      userId: null,
      validated: "a38f5889-8fef-46d4-8ede-bf4668b6a9bb",
      lastUsed: 0,
      requestCount: 0,
      isExhausted: false,
      exhaustedUntil: 0,
    },
    {
      email: "kevingarcia2024@gmail.com",
      userId: null,
      validated: "a38f5889-8fef-46d4-8ede-bf4668b6a9bb",
      lastUsed: 0,
      requestCount: 0,
      isExhausted: false,
      exhaustedUntil: 0,
    },
    {
      email: "rachelrobinson2024@gmail.com",
      userId: null,
      validated: "a38f5889-8fef-46d4-8ede-bf4668b6a9bb",
      lastUsed: 0,
      requestCount: 0,
      isExhausted: false,
      exhaustedUntil: 0,
    },
    {
      email: "brandonclark2024@gmail.com",
      userId: null,
      validated: "a38f5889-8fef-46d4-8ede-bf4668b6a9bb",
      lastUsed: 0,
      requestCount: 0,
      isExhausted: false,
      exhaustedUntil: 0,
    },
    {
      email: "stephanielewis2024@gmail.com",
      userId: null,
      validated: "a38f5889-8fef-46d4-8ede-bf4668b6a9bb",
      lastUsed: 0,
      requestCount: 0,
      isExhausted: false,
      exhaustedUntil: 0,
    },
  ]

  private currentIndex = 0
  private readonly EXHAUSTION_TIME = 60 * 60 * 1000 // 1 hora de cooldown después de rate limit

  getNextToken(): TokenConfig {
    const now = Date.now()

    // Primero, revisar si algún token exhausto ya puede usarse de nuevo
    this.tokens.forEach((token) => {
      if (token.isExhausted && now > token.exhaustedUntil) {
        token.isExhausted = false
        token.requestCount = 0
        console.log(`[v0] Token ${token.email} recovered from exhaustion`)
      }
    })

    // Buscar un token disponible
    for (let i = 0; i < this.tokens.length; i++) {
      const tokenIndex = (this.currentIndex + i) % this.tokens.length
      const token = this.tokens[tokenIndex]

      if (!token.isExhausted) {
        token.lastUsed = now
        token.requestCount++
        this.currentIndex = (tokenIndex + 1) % this.tokens.length // Rotar al siguiente
        console.log(`[v0] Using token: ${token.email} (Request #${token.requestCount})`)
        return token
      }
    }

    // Si todos están exhaustos, usar el que se recupere más pronto
    const nextAvailable = this.tokens.reduce((prev, current) =>
      prev.exhaustedUntil < current.exhaustedUntil ? prev : current,
    )

    console.log(`[v0] All tokens exhausted, using least exhausted: ${nextAvailable.email}`)
    return nextAvailable
  }

  markTokenExhausted(email: string) {
    const token = this.tokens.find((t) => t.email === email)
    if (token) {
      token.isExhausted = true
      token.exhaustedUntil = Date.now() + this.EXHAUSTION_TIME
      console.log(
        `[v0] Token ${email} marked as exhausted until ${new Date(token.exhaustedUntil).toLocaleTimeString()}`,
      )
    }
  }

  getAvailableTokensCount(): number {
    const now = Date.now()
    return this.tokens.filter((token) => !token.isExhausted || now > token.exhaustedUntil).length
  }

  resetToken(email: string) {
    const token = this.tokens.find((t) => t.email === email)
    if (token) {
      token.requestCount = 0
      token.lastUsed = 0
      token.isExhausted = false
      token.exhaustedUntil = 0
      console.log(`[v0] Token ${email} manually reset`)
    }
  }

  getTokenStats() {
    const now = Date.now()
    return this.tokens.map((token) => ({
      email: token.email,
      requestCount: token.requestCount,
      lastUsed: new Date(token.lastUsed).toISOString(),
      isExhausted: token.isExhausted,
      availableIn: token.isExhausted ? Math.max(0, token.exhaustedUntil - now) : 0,
      available: !token.isExhausted,
    }))
  }

  resetAllTokens() {
    this.tokens.forEach((token) => {
      token.requestCount = 0
      token.lastUsed = 0
      token.isExhausted = false
      token.exhaustedUntil = 0
    })
    console.log(`[v0] All tokens reset`)
  }
}

export const tokenManager = new TokenRotationManager()
