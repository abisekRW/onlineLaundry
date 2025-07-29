import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { defaultServices } from '../data/services';

export const initializeServices = async () => {
  try {
    const servicesCollection = collection(db, 'services');
    const servicesSnapshot = await getDocs(servicesCollection);
    
    // Only initialize if no services exist
    if (servicesSnapshot.empty) {
      for (const service of defaultServices) {
        const serviceId = service.name.toLowerCase().replace(/\s+/g, '_');
        await setDoc(doc(db, 'services', serviceId), service);
      }
      console.log('Services initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing services:', error);
  }
};