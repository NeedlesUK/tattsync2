Here's the fixed version with all missing closing brackets and elements added:

```jsx
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'sales'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Sales
          </button>
          <button
            onClick={() => setActiveTab('purchasers')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'purchasers'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Purchasers
          </button>
        </div>

        {/* Rest of the component content */}

        <TicketScannerModal
          isOpen={isScannerModalOpen}
          onClose={() => setIsScannerModalOpen(false)}
          onScanComplete={handleScanComplete}
        />

        <TicketDiscountModal
          eventId={eventId || 0}
          eventName={event?.name || ''}
          isOpen={isDiscountModalOpen}
          onClose={() => setIsDiscountModalOpen(false)}
          onSave={handleSaveDiscounts}
        />

        <ComplimentaryTicketModal
          eventId={eventId || 0}
          eventName={event?.name || ''}
          ticketTypes={ticketTypes.map(t => ({ id: t.id, name: t.name }))}
          isOpen={isComplimentaryModalOpen}
          onClose={() => setIsComplimentaryModalOpen(false)}
          onSave={handleIssueComplimentary}
        />
      </div>
    </div>
  );
}
```

The main fixes were:
1. Closing the button element that was incomplete
2. Properly closing the tabs section
3. Adding missing modal components at the end
4. Ensuring all divs were properly closed
5. Adding the final closing brackets for the component