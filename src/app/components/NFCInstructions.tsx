import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Tag, Smartphone, Wifi, AlertCircle, CheckCircle } from 'lucide-react';

interface NFCInstructionsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NFCInstructions({ isOpen, onClose }: NFCInstructionsProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Tag className="w-6 h-6 text-green-600" />
            NFC Tag Usage Guide
          </DialogTitle>
          <DialogDescription>
            Learn how to write and read NFC tags for tree management
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Browser Compatibility */}
          <Alert>
            <Smartphone className="h-4 w-4" />
            <AlertDescription>
              <strong>Device Requirements:</strong> Web NFC API is supported on Android devices with Chrome 89+. 
              iOS does not currently support Web NFC API in browsers.
            </AlertDescription>
          </Alert>

          {/* Writing NFC Tags (Field User) */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Tag className="w-5 h-5 text-blue-600" />
              Writing NFC Tags (Field User)
            </h3>
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">1</span>
                <div>
                  <strong>Fill in all tree information</strong> - Tree name, species, health status, age
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">2</span>
                <div>
                  <strong>Capture GPS location</strong> - Click "Capture Current Location" button to get precise coordinates
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">3</span>
                <div>
                  <strong>Click "Save & Write to NFC Tag"</strong> - This saves to database and initiates NFC write
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">4</span>
                <div>
                  <strong>Hold NFC tag near device</strong> - Keep the tag close to the NFC antenna (usually on the back of the phone) for 2-3 seconds
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">5</span>
                <div>
                  <strong>Wait for confirmation</strong> - You'll see a success message when the tag is written
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">6</span>
                <div>
                  <strong>Attach tag to tree</strong> - Securely attach the NFC tag to the tree for future scanning
                </div>
              </li>
            </ol>
          </div>

          {/* Reading NFC Tags (Admin) */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-green-600" />
              Reading NFC Tags (Admin)
            </h3>
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">1</span>
                <div>
                  <strong>Navigate to Dashboard</strong> - Go to the Admin Home page
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">2</span>
                <div>
                  <strong>Click "Scan NFC Tag"</strong> - This activates the NFC reader on your device
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">3</span>
                <div>
                  <strong>Hold tag near device</strong> - Place the NFC tag close to your device's NFC antenna
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">4</span>
                <div>
                  <strong>View tree data</strong> - The tree information will be displayed on screen immediately
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">5</span>
                <div>
                  <strong>Edit if needed</strong> - Navigate to Database page to edit or update the tree record
                </div>
              </li>
            </ol>
          </div>

          {/* Compatible NFC Tags */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Compatible NFC Tags</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <div>
                  <strong>NTAG213</strong> - 144 bytes, ideal for basic tree data
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <div>
                  <strong>NTAG215</strong> - 504 bytes, recommended for expanded data
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <div>
                  <strong>NTAG216</strong> - 888 bytes, maximum data capacity
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Tips for Success</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>Remove phone case if NFC isn't working - some cases block NFC signals</div>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>Make sure NFC is enabled in your device settings</div>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>Keep tags away from metal surfaces which can interfere with NFC</div>
              </div>
              <div className="flex items-start gap-2">
                <Wifi className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>Data is saved to database even if NFC write fails - you can always write to a tag later</div>
              </div>
            </div>
          </div>

          {/* Offline Support */}
          <Alert className="bg-green-50 border-green-200">
            <Wifi className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <strong>Offline Support:</strong> The app works offline! Data is stored locally and NFC operations 
              work without internet connection. Data syncs automatically when connection is restored.
            </AlertDescription>
          </Alert>
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose}>Got it!</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
