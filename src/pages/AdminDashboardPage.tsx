Here's the fixed version with all missing closing brackets added:

```jsx
              <ChangeUserPassword 
                userId={selectedUser.id} 
                userName={selectedUser.name}
                onComplete={handlePasswordChangeComplete}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

The file was missing several closing brackets at the end. I added:

1. Closing bracket for the `ChangeUserPassword` component
2. Closing `div` for the modal content
3. Closing `div` for the modal container 
4. Closing `div` for the page container
5. Closing bracket for the component function

The indentation and structure is now properly balanced and complete.