import { TreeData } from './storage';

// Web NFC API types (TypeScript doesn't have built-in types for this)
declare global {
  interface Window {
    NDEFReader: any;
  }
  const NDEFReader: any;
}

export const nfcUtils = {
  // Check if NFC is supported
  isSupported(): boolean {
    return 'NDEFReader' in window;
  },

  // Write tree data to NFC tag
  async writeToTag(treeData: TreeData): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('NFC is not supported on this device');
    }

    try {
      // @ts-ignore - Web NFC API
      const ndef = new NDEFReader();
      
      // Format data as JSON string for the NFC tag
      const message = {
        records: [
          {
            recordType: "text",
            data: JSON.stringify({
              id: treeData.id,
              name: treeData.name,
              species: treeData.species,
              healthStatus: treeData.healthStatus,
              age: treeData.age,
              latitude: treeData.latitude,
              longitude: treeData.longitude,
              dateAdded: treeData.dateAdded,
              addedBy: treeData.addedBy,
            }),
          },
        ],
      };

      await ndef.write(message);
      console.log('Tree data written to NFC tag successfully');
    } catch (error) {
      console.error('Error writing to NFC tag:', error);
      throw error;
    }
  },

  // Read tree data from NFC tag
  async readFromTag(): Promise<TreeData> {
    if (!this.isSupported()) {
      throw new Error('NFC is not supported on this device');
    }

    try {
      // @ts-ignore - Web NFC API
      const ndef = new NDEFReader();
      await ndef.scan();

      return new Promise((resolve, reject) => {
        ndef.addEventListener("reading", ({ message }: any) => {
          for (const record of message.records) {
            if (record.recordType === "text") {
              const textDecoder = new TextDecoder();
              const text = textDecoder.decode(record.data);
              try {
                const treeData = JSON.parse(text);
                resolve(treeData as TreeData);
              } catch (e) {
                reject(new Error('Invalid tree data on NFC tag'));
              }
              return;
            }
          }
          reject(new Error('No text record found on NFC tag'));
        });

        ndef.addEventListener("readingerror", () => {
          reject(new Error('Error reading NFC tag'));
        });

        // Timeout after 30 seconds
        setTimeout(() => {
          reject(new Error('NFC scan timeout'));
        }, 30000);
      });
    } catch (error) {
      console.error('Error reading from NFC tag:', error);
      throw error;
    }
  },

  // Stop NFC scanning
  async stopScan(): Promise<void> {
    // The NDEFReader doesn't have a stop method in the current spec
    // Scanning stops automatically when reading is complete
  },
};
