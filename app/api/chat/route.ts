import { type NextRequest, NextResponse } from "next/server"
import { saveChatMessage, createChatSession } from "@/lib/database"
import { tokenManager } from "@/lib/token-rotation"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message: userMessage, userId, messageId, sessionId, webSearchEnabled } = body

    let currentSessionId = sessionId

    // If user is logged in but no session ID, create a new session
    if (userId && !currentSessionId) {
      currentSessionId = await createChatSession(userId, "New Chat")
    }

    // Save user message if user is logged in
    if (userId && currentSessionId) {
      await saveChatMessage(userId, currentSessionId, messageId, userMessage, "user")
    }

    let attempts = 0
    const maxAttempts = 8 // Increased max attempts since we have more tokens
    let lastError = null

    const availableTokens = tokenManager.getAvailableTokensCount()
    if (availableTokens === 0) {
      console.log("[v0] No tokens available, all are exhausted")
      return NextResponse.json({
        response:
          "All tokens are currently rate limited. Please wait about an hour for the system to recover automatically, or try again later.",
      })
    }

    console.log(`[v0] Starting request with ${availableTokens} available tokens`)

    while (attempts < maxAttempts) {
      const currentToken = tokenManager.getNextToken()
      if (!currentToken) {
        console.log("[v0] No more tokens available during rotation")
        break
      }

      console.log(
        `[v0] Attempt ${attempts + 1}: Using token: ${currentToken.email} (Request #${currentToken.requestCount})`,
      )

      try {
        // Prepare the body for the Blackbox AI API request
        const blackboxRequestBody = JSON.stringify({
          messages: [
            {
              id: messageId || Date.now().toString(),
              content: userMessage,
              role: "user",
            },
          ],
          id: messageId || Date.now().toString(),
          previewToken: null,
          userId: null,
          codeModelMode: true,
          trendingAgentMode: {},
          isMicMode: false,
          userSystemPrompt: "You are PutinGPT, an AI assistant. Your name is PutinGPT.",
          maxTokens: 99999,
          playgroundTopP: null,
          playgroundTemperature: null,
          isChromeExt: false,
          githubToken: "",
          clickedAnswer2: false,
          clickedAnswer3: false,
          clickedForceWebSearch: webSearchEnabled || false,
          visitFromDelta: false,
          isMemoryEnabled: false,
          mobileClient: false,
          userSelectedModel: null,
          userSelectedAgent: "VscodeAgent",
          validated: currentToken.validated,
          imageGenerationMode: false,
          imageGenMode: "autoMode",
          webSearchModePrompt: webSearchEnabled || false,
          deepSearchMode: false,
          domains: null,
          vscodeClient: false,
          codeInterpreterMode: false,
          customProfile: {
            name: "PutinGPT",
            occupation: "AI Assistant",
            traits: ["helpful", "knowledgeable", "friendly"],
            additionalInfo: "I am PutinGPT, an AI assistant here to help with various tasks and questions.",
            enableNewChats: false,
          },
          webSearchModeOption: {
            autoMode: webSearchEnabled || false,
            webMode: webSearchEnabled || false,
            offlineMode: !webSearchEnabled,
          },
          session: {
            user: {
              email: currentToken.email,
              id: currentToken.userId,
            },
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            isNewUser: false,
          },
          isPremium: true,
          subscriptionCache: {
            status: "PREMIUM",
            expiryTimestamp: null,
            lastChecked: Date.now(),
            isTrialSubscription: false,
          },
          beastMode: false,
          reasoningMode: false,
          designerMode: false,
          workspaceId: "",
          asyncMode: false,
          integrations: {},
          isTaskPersistent: false,
          selectedElement: null,
        })

        // Make request to Blackbox AI API
        const response = await fetch("https://www.blackbox.ai/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0",
            Accept: "*/*",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate, br",
            Origin: "https://www.blackbox.ai",
            Referer: "https://www.blackbox.ai/",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            Priority: "u=0",
          },
          body: blackboxRequestBody,
        })

        if (!response.ok) {
          if (response.status === 429) {
            console.log(`[v0] Rate limit hit for ${currentToken.email}, marking as exhausted and trying next token...`)
            tokenManager.markTokenExhausted(currentToken.email)
            attempts++
            await new Promise((resolve) => setTimeout(resolve, 500))
            continue
          } else if (response.status >= 500) {
            throw new Error("Blackbox AI API internal server error. Please try again later.")
          } else {
            const errorBody = await response.text()
            throw new Error(
              `Blackbox AI API returned an error: ${response.status} ${response.statusText} - ${errorBody}`,
            )
          }
        }

        const rawData = await response.text()
        console.log(`[v0] Raw response length: ${rawData.length}`)

        let cleanAnswer = rawData

        if (webSearchEnabled && rawData.includes("$~~~$")) {
          const parts = rawData.split("$~~~$")
          // Get the main answer part (usually the last meaningful part)
          for (let i = parts.length - 1; i >= 0; i--) {
            const part = parts[i].trim()
            if (
              part &&
              part.length > 20 &&
              !part.startsWith("[") &&
              !part.startsWith("{") &&
              !part.includes("Sources:")
            ) {
              cleanAnswer = part
              break
            }
          }
        }

        // Clean up the response
        cleanAnswer = cleanAnswer
          .replace(/^\[.*?\]/, "")
          .replace(/\$~~~\$/g, "")
          .replace(/^[{[].*?[}\]]/, "")
          .replace(/^Sources:.*$/gm, "")
          .replace(/\n\s*\n/g, "\n")
          .trim()

        if (!cleanAnswer || cleanAnswer.length < 10) {
          cleanAnswer =
            "I'm sorry, I couldn't process your request properly. Could you please try rephrasing your question?"
        }

        // Save assistant response if user is logged in
        if (userId && currentSessionId) {
          const assistantMessageId = (Date.now() + 1).toString()
          await saveChatMessage(userId, currentSessionId, assistantMessageId, cleanAnswer, "assistant")
        }

        console.log(`[v0] Successfully processed request with token: ${currentToken.email}`)
        return NextResponse.json({
          response: cleanAnswer,
          sessionId: currentSessionId,
          webSearchUsed: webSearchEnabled,
        })
      } catch (error) {
        lastError = error
        console.error(`[v0] Error with token ${currentToken.email}:`, error)
        if (error instanceof Error && (error.message.includes("429") || error.message.includes("rate limit"))) {
          tokenManager.markTokenExhausted(currentToken.email)
        }
        attempts++
        if (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }
    }

    // If all attempts failed
    console.log(`[v0] All ${maxAttempts} attempts failed. Available tokens: ${tokenManager.getAvailableTokensCount()}`)
    throw lastError || new Error("All token attempts exhausted")
  } catch (error) {
    console.error("Chat API Error:", error)
    let errorMessage = "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment."
    if (error instanceof Error) {
      if (
        error.message.includes("Blackbox AI API") ||
        error.message.includes("Rate limit") ||
        error.message.includes("token")
      ) {
        errorMessage =
          "The system is currently experiencing high demand. I'm automatically switching between available resources. Please try again in a few seconds."
      }
    }
    return NextResponse.json(
      {
        response: errorMessage,
      },
      { status: 200 }, // Changed to 200 to avoid frontend error handling
    )
  }
}
