# Agent Components

React components for the Fabiola and Jaynette AI agents.

---

## Components

### FabiolaChat

**File**: `FabiolaChat.tsx`
**Type**: Public-facing chat widget
**Location**: Integrated into `/rfimap` page

**Features**:
- Floating chat widget with minimize/maximize
- Bilingual (English/Spanish) interface
- Quick action buttons for common queries
- Real-time messaging via Convex
- Markdown support for rich responses
- Auto-scroll to latest messages
- Loading states and error handling

**Usage**:
```tsx
import FabiolaChat from "@/agents/components/FabiolaChat";

export default function Page() {
  return (
    <div>
      {/* Your page content */}
      <FabiolaChat />
    </div>
  );
}
```

**Quick Actions**:
- "Find warehouses" - Searches for warehouse facilities
- "Airports & Ports" - Lists airports and ports
- "Nearby facilities" - Finds facilities near a location

**Props**: None (self-contained with internal state)

**Dependencies**:
- `convex/react` - Real-time queries
- `lucide-react` - Icons
- `react-markdown` - Rich text responses
- Pulls from `agents/lib/config.ts` for agent configuration

---

### JaynetteAdmin

**File**: `JaynetteAdmin.tsx`
**Type**: Administrative interface (full page)
**Location**: Not yet integrated (pending admin route creation)

**Features**:
- Password-protected authentication
- Session management with 4-hour expiration
- Session expiration countdown display
- Quick action buttons for admin operations
- Professional dashboard UI
- Real-time messaging via Convex
- Markdown support for rich responses
- Secure logout with session cleanup

**Usage**:
```tsx
// app/admin/page.tsx
import JaynetteAdmin from "@/agents/components/JaynetteAdmin";

export default function AdminPage() {
  return <JaynetteAdmin />;
}
```

**Authentication**:
- Password: Set via `ADMIN_INTERFACE_PASSWORD` environment variable
- Session: 4-hour token-based authentication
- Auto-logout on session expiration

**Quick Actions**:
- "Create facility" - Initiates facility creation workflow
- "Generate report" - Creates analytics reports
- "Bulk import" - Starts bulk import with dry-run option

**Props**: None (self-contained with internal state)

**Dependencies**:
- `convex/react` - Real-time queries
- `lucide-react` - Icons
- `react-markdown` - Rich text responses
- `sonner` - Toast notifications
- Pulls from `agents/lib/config.ts` for agent configuration

---

## Component Architecture

Both components follow the same architectural pattern:

```
┌─────────────────────────────────────────┐
│          React Component                │
│  ┌─────────────────────────────────┐   │
│  │  UI Layer                       │   │
│  │  - Chat interface               │   │
│  │  - Message display              │   │
│  │  - Input handling               │   │
│  └──────────┬──────────────────────┘   │
│             │                           │
│  ┌──────────▼──────────────────────┐   │
│  │  State Management               │   │
│  │  - useState hooks               │   │
│  │  - useEffect for side effects   │   │
│  └──────────┬──────────────────────┘   │
│             │                           │
│  ┌──────────▼──────────────────────┐   │
│  │  Convex Integration             │   │
│  │  - useQuery for messages        │   │
│  │  - useMutation for actions      │   │
│  └──────────┬──────────────────────┘   │
└─────────────┼───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│       Convex Backend                    │
│  ┌─────────────────────────────────┐   │
│  │  Agent Actions                  │   │
│  │  - createThread()               │   │
│  │  - chat() / adminChat()         │   │
│  │  - getThreadMessages()          │   │
│  └──────────┬──────────────────────┘   │
│             │                           │
│  ┌──────────▼──────────────────────┐   │
│  │  Agent Tools                    │   │
│  │  - Search, details, nearby      │   │
│  │  - Create, update, delete       │   │
│  │  - Bulk import, reports         │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## Styling

Both components use Tailwind CSS for styling:

**FabiolaChat**:
- Primary color: Blue (`bg-blue-600`)
- Floating position: `fixed bottom-6 right-6`
- Widget size: `w-[400px] h-[600px]`
- Z-index: `z-50` (above map elements)

**JaynetteAdmin**:
- Primary color: Indigo (`bg-indigo-600`)
- Layout: Full-screen with header
- Professional admin aesthetic
- Responsive grid for quick actions

**Customization**:
To change colors, search for color classes:
- FabiolaChat: Replace `blue-*` classes
- JaynetteAdmin: Replace `indigo-*` classes

---

## State Management

### FabiolaChat State

```typescript
const [isOpen, setIsOpen] = useState(false);           // Widget open/closed
const [isMinimized, setIsMinimized] = useState(false); // Minimized state
const [message, setMessage] = useState("");            // Current input
const [threadId, setThreadId] = useState<string | null>(null); // Conversation ID
const [isLoading, setIsLoading] = useState(false);     // Message sending
```

### JaynetteAdmin State

```typescript
const [isAuthenticated, setIsAuthenticated] = useState(false); // Login status
const [sessionToken, setSessionToken] = useState<string | null>(null); // Auth token
const [password, setPassword] = useState("");          // Login input
const [isAuthenticating, setIsAuthenticating] = useState(false); // Login loading
const [message, setMessage] = useState("");            // Current input
const [threadId, setThreadId] = useState<string | null>(null); // Conversation ID
const [isLoading, setIsLoading] = useState(false);     // Message sending
```

---

## Convex Integration

### FabiolaChat Convex Calls

**Queries**:
```typescript
// Get conversation messages
const messages = useQuery(
  api.agents.fabiola.getThreadMessages,
  threadId ? { threadId } : "skip"
);
```

**Mutations**:
```typescript
// Create new thread
const createThread = useMutation(api.agents.fabiola.createThread);

// Send message
const sendMessage = useMutation(api.agents.fabiola.chat);
```

### JaynetteAdmin Convex Calls

**Queries**:
```typescript
// Get conversation messages (with auth)
const messages = useQuery(
  api.agents.jaynette.getThreadMessages,
  threadId && sessionToken ? { threadId, sessionToken } : "skip"
);

// Validate session
const sessionStatus = useQuery(
  api.adminSessions.validate,
  sessionToken ? { token: sessionToken } : "skip"
);
```

**Mutations**:
```typescript
// Authenticate
const authenticate = useMutation(api.adminSessions.authenticate);

// Create thread (with auth)
const createThread = useMutation(api.agents.jaynette.createThread);

// Send message (with auth)
const sendMessage = useMutation(api.agents.jaynette.adminChat);

// Logout
const logout = useMutation(api.adminSessions.invalidate);
```

---

## User Experience Flow

### FabiolaChat Flow

1. **Page loads** → Chat button appears (bottom-right)
2. **User clicks button** → Widget opens, thread created automatically
3. **Welcome screen** → Shows greeting + quick action buttons
4. **User sends message** → Message added to chat, loading spinner appears
5. **Agent responds** → Response appears with markdown formatting
6. **Conversation continues** → All messages persist in thread
7. **User closes widget** → Widget closes, conversation saved

### JaynetteAdmin Flow

1. **Page loads** → Login screen displayed
2. **Admin enters password** → Authentication attempted
3. **Login success** → Session created, dashboard opens, thread created
4. **Welcome screen** → Shows greeting + admin quick actions
5. **Admin sends command** → Message added, loading spinner appears
6. **Agent responds** → Response with operation results
7. **Session active** → Countdown shows time until expiration
8. **Admin logs out** → Session invalidated, redirects to login

---

## Error Handling

### FabiolaChat Errors

**Thread creation fails**:
- Shows loading spinner indefinitely
- **Fix**: Add timeout and retry logic

**Message send fails**:
- Console error logged
- **Fix**: Show toast notification to user

**Connection lost**:
- Convex handles reconnection automatically
- **Fix**: Add offline indicator

### JaynetteAdmin Errors

**Authentication fails**:
- Toast notification: "Authentication failed. Check your password."
- Remains on login screen

**Session expires**:
- Toast notification: "Session expired. Please log in again."
- Redirects to login screen
- Thread data cleared

**Message send fails**:
- Toast notification: "Failed to send message"
- Console error logged

---

## Performance Considerations

### Optimization Techniques

**Auto-scroll**:
```typescript
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);
```
- Only triggers when messages change
- Uses smooth scrolling for better UX

**Conditional queries**:
```typescript
const messages = useQuery(
  api.agents.fabiola.getThreadMessages,
  threadId ? { threadId } : "skip" // Skip query if no thread
);
```
- Prevents unnecessary API calls
- Reduces bandwidth usage

**Debounced input** (not implemented, future enhancement):
```typescript
// Wait for user to stop typing before processing
const debouncedMessage = useDebounce(message, 300);
```

---

## Accessibility

### Keyboard Support

**FabiolaChat**:
- `Enter` key sends message
- `Shift+Enter` for newlines (currently disabled, can be added)
- All buttons have `aria-label` attributes

**JaynetteAdmin**:
- `Enter` key sends message in chat
- `Enter` key submits login form
- Focus management on login success

### Screen Reader Support

- All buttons have descriptive labels
- Loading states announced via spinners
- Error messages visible and readable

---

## Testing

### Manual Testing Checklist

**FabiolaChat**:
- [ ] Widget button appears on page load
- [ ] Widget opens when button clicked
- [ ] Thread created automatically
- [ ] Welcome message and quick actions displayed
- [ ] Quick actions populate input field
- [ ] Messages send successfully
- [ ] Responses appear with formatting
- [ ] Widget minimizes/maximizes correctly
- [ ] Widget closes and reopens preserving state
- [ ] Auto-scroll works with new messages

**JaynetteAdmin**:
- [ ] Login form displays on page load
- [ ] Wrong password shows error
- [ ] Correct password logs in successfully
- [ ] Session token stored correctly
- [ ] Dashboard opens after login
- [ ] Thread created automatically
- [ ] Welcome message and quick actions displayed
- [ ] Quick actions populate input field
- [ ] Messages send successfully (with auth)
- [ ] Session countdown displays correctly
- [ ] Logout clears session and redirects

### Unit Testing (Recommended)

```typescript
// Example test structure
describe("FabiolaChat", () => {
  it("renders chat button when closed", () => {
    render(<FabiolaChat />);
    expect(screen.getByLabelText("Open chat with Fabiola")).toBeInTheDocument();
  });

  it("opens widget when button clicked", async () => {
    render(<FabiolaChat />);
    fireEvent.click(screen.getByLabelText("Open chat with Fabiola"));
    expect(await screen.findByText("¡Hola! I'm Fabiola")).toBeInTheDocument();
  });
});
```

---

## Future Enhancements

### Planned Features

**FabiolaChat**:
- [ ] Streaming responses (real-time typing effect)
- [ ] Voice input support
- [ ] Export conversation history
- [ ] Language switcher (EN/ES toggle)
- [ ] Dark mode support
- [ ] Conversation search
- [ ] Attachment support (images, files)

**JaynetteAdmin**:
- [ ] Multi-factor authentication
- [ ] Role-based access control
- [ ] Operation audit log viewer
- [ ] Bulk operation progress bars
- [ ] Export reports to CSV/PDF
- [ ] Scheduled operations
- [ ] Team collaboration features

### Potential Improvements

**Performance**:
- Implement message virtualization for long conversations
- Add conversation summarization after 50 messages
- Cache frequent queries client-side

**UX**:
- Add typing indicators
- Show tool execution status ("Searching facilities...")
- Add message reactions/feedback
- Implement conversation ratings

**Accessibility**:
- Add keyboard shortcuts (Cmd+K to open chat)
- Implement focus trapping in modals
- Add high-contrast mode
- Support screen magnification

---

## Troubleshooting

### Common Issues

**Issue**: Widget doesn't open
- **Cause**: JavaScript error in console
- **Fix**: Check browser console for errors, ensure all dependencies installed

**Issue**: Messages not sending
- **Cause**: Convex not connected or thread ID missing
- **Fix**: Verify Convex deployment URL in environment variables

**Issue**: "Invalid session" error (Jaynette)
- **Cause**: Session expired or token invalid
- **Fix**: Log out and log back in, check session duration settings

**Issue**: Responses are placeholder text
- **Cause**: Claude Agent SDK not integrated yet
- **Fix**: See `agents/docs/FUTURE_WORK.md` for integration steps

**Issue**: Styling looks broken
- **Cause**: Tailwind CSS not compiled or conflicting styles
- **Fix**: Run `npm run dev` to rebuild, check for CSS conflicts

---

## Dependencies

### Required NPM Packages

```json
{
  "dependencies": {
    "convex": "^1.27.0",
    "lucide-react": "^0.544.0",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-markdown": "^10.1.0",
    "sonner": "^2.0.7"
  }
}
```

### Internal Dependencies

- `convex/_generated/api` - Generated Convex API types
- `agents/lib/config.ts` - Agent configurations (not directly imported yet)
- `agents/lib/types.ts` - Shared type definitions (not directly imported yet)

---

## Configuration

### Environment Variables

**Required**:
- `NEXT_PUBLIC_CONVEX_URL` - Convex deployment URL
- `CONVEX_DEPLOYMENT` - Convex deployment name

**For Jaynette**:
- `ADMIN_INTERFACE_PASSWORD` - Admin login password (set in Convex dashboard)

**For AI Integration** (future):
- `OPENROUTER_API_KEY` - OpenRouter API key
- `ADMIN_SECRET_KEY` - Database write operations key

See `.env.example` for complete list and descriptions.

---

## Contributing

When modifying these components:

1. **Maintain modularity** - Keep pulling config from `agents/lib/`
2. **Preserve type safety** - Use TypeScript properly, avoid `any`
3. **Update documentation** - Reflect changes in this README
4. **Test thoroughly** - Check both happy path and error cases
5. **Follow patterns** - Keep consistent with existing code style

---

## Support

For questions or issues:
1. Check `agents/docs/ARCHITECTURE.md` for system overview
2. Check `agents/docs/FUTURE_WORK.md` for SDK integration
3. Check `convex/agents/README.md` for backend tools reference
4. Review Convex logs for backend errors
5. Check browser console for frontend errors

---

**Last Updated**: 2025-10-03
**Component Status**: Complete (UI), Pending (AI Integration)
**Maintainer**: Development Team
