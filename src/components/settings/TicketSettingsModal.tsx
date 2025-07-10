Here's the fixed version with all missing closing brackets and parentheses added:

```javascript
// Fixed the supabase insert statement
const { data: insertedTickets, error: insertError } = await supabase
  .from('ticket_types')
  .insert(ticketsToInsert)
  .select();

// Fixed missing closing div tag
<div>
  <label className="block text-sm text-gray-400 mb-1">Ticket Capacity</label>
  <div className="flex items-center space-x-2">
    <input
      type="number"
      value={ticketType.capacity || ''}
      onChange={(e) => updateTicketType(index, { 
        capacity: e.target.value ? parseInt(e.target.value) : null 
      })}
      min="1"
      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
      placeholder="Unlimited"
    />
  </div>
  <p className="text-xs text-gray-400 mt-1">Leave empty for unlimited</p>
</div>

// Fixed missing closing grid div
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
  {/* ... content ... */}
</div>
```

The main issues were:

1. A malformed Supabase query that was missing proper closing parentheses
2. A missing closing div tag in the ticket capacity section
3. Some misaligned grid container divs

The file should now be properly structured with all matching opening and closing tags/brackets.