import { createSPAClient } from '@/lib/supabase/client';
import { Brand, BriefBatch, BriefConcept, DbBrand, DbBriefConcept, ShareSettings, ShareResult } from '@/lib/types/powerbrief';
import { v4 as uuidv4 } from 'uuid';

const supabase = createSPAClient();

// Brand Services
export async function getBrands(userId: string): Promise<Brand[]> {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching brands:', error);
    throw error;
  }

  // Transform from DB format to app format
  return (data || []).map((item: DbBrand) => ({
    ...item,
    brand_info_data: item.brand_info_data as unknown as Brand['brand_info_data'],
    target_audience_data: item.target_audience_data as unknown as Brand['target_audience_data'],
    competition_data: item.competition_data as unknown as Brand['competition_data'],
  }));
}

export async function getBrandById(brandId: string): Promise<Brand | null> {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('id', brandId)
    .single();

  if (error) {
    console.error('Error fetching brand:', error);
    throw error;
  }

  if (!data) return null;

  // Transform from DB format to app format
  return {
    ...data,
    brand_info_data: data.brand_info_data as unknown as Brand['brand_info_data'],
    target_audience_data: data.target_audience_data as unknown as Brand['target_audience_data'],
    competition_data: data.competition_data as unknown as Brand['competition_data'],
  };
}

export async function createBrand(brand: Omit<Brand, 'id' | 'created_at' | 'updated_at'>): Promise<Brand> {
  const dbBrand = {
    ...brand,
    id: uuidv4(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('brands')
    .insert(dbBrand)
    .select()
    .single();

  if (error) {
    console.error('Error creating brand:', error);
    throw error;
  }

  // Transform from DB format to app format
  return {
    ...data,
    brand_info_data: data.brand_info_data as unknown as Brand['brand_info_data'],
    target_audience_data: data.target_audience_data as unknown as Brand['target_audience_data'],
    competition_data: data.competition_data as unknown as Brand['competition_data'],
  };
}

export async function updateBrand(brand: Partial<Brand> & { id: string }): Promise<Brand> {
  const dbBrand = {
    ...brand,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('brands')
    .update(dbBrand)
    .eq('id', brand.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating brand:', error);
    throw error;
  }

  // Transform from DB format to app format
  return {
    ...data,
    brand_info_data: data.brand_info_data as unknown as Brand['brand_info_data'],
    target_audience_data: data.target_audience_data as unknown as Brand['target_audience_data'],
    competition_data: data.competition_data as unknown as Brand['competition_data'],
  };
}

export async function deleteBrand(brandId: string): Promise<void> {
  const { error } = await supabase
    .from('brands')
    .delete()
    .eq('id', brandId);

  if (error) {
    console.error('Error deleting brand:', error);
    throw error;
  }
}

// Brief Batch Services
export async function getBriefBatches(brandId: string): Promise<BriefBatch[]> {
  const { data, error } = await supabase
    .from('brief_batches')
    .select('*')
    .eq('brand_id', brandId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching brief batches:', error);
    throw error;
  }

  return data || [];
}

export async function getBriefBatchById(batchId: string): Promise<BriefBatch | null> {
  const { data, error } = await supabase
    .from('brief_batches')
    .select('*')
    .eq('id', batchId)
    .single();

  if (error) {
    console.error('Error fetching brief batch:', error);
    throw error;
  }

  return data;
}

export async function createBriefBatch(batch: Omit<BriefBatch, 'id' | 'created_at' | 'updated_at'>): Promise<BriefBatch> {
  const newBatch = {
    ...batch,
    id: uuidv4(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('brief_batches')
    .insert(newBatch)
    .select()
    .single();

  if (error) {
    console.error('Error creating brief batch:', error);
    throw error;
  }

  return data;
}

export async function updateBriefBatch(batch: Partial<BriefBatch> & { id: string }): Promise<BriefBatch> {
  const { data, error } = await supabase
    .from('brief_batches')
    .update({
      ...batch,
      updated_at: new Date().toISOString()
    })
    .eq('id', batch.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating brief batch:', error);
    throw error;
  }

  return data;
}

export async function deleteBriefBatch(batchId: string): Promise<void> {
  const { error } = await supabase
    .from('brief_batches')
    .delete()
    .eq('id', batchId);

  if (error) {
    console.error('Error deleting brief batch:', error);
    throw error;
  }
}

// Brief Concept Services
export async function getBriefConcepts(batchId: string): Promise<BriefConcept[]> {
  const { data, error } = await supabase
    .from('brief_concepts')
    .select('*')
    .eq('brief_batch_id', batchId)
    .order('order_in_batch', { ascending: true });

  if (error) {
    console.error('Error fetching concepts:', error);
    throw error;
  }

  // Transform from DB format to app format
  return (data || []).map((item: DbBriefConcept) => ({
    ...item,
    body_content_structured: item.body_content_structured as unknown as BriefConcept['body_content_structured'],
  }));
}

export async function getBriefConceptById(conceptId: string): Promise<BriefConcept | null> {
  const { data, error } = await supabase
    .from('brief_concepts')
    .select('*')
    .eq('id', conceptId)
    .single();

  if (error) {
    console.error('Error fetching concept:', error);
    throw error;
  }

  if (!data) return null;

  // Transform from DB format to app format
  return {
    ...data,
    body_content_structured: data.body_content_structured as unknown as BriefConcept['body_content_structured'],
  };
}

export async function createBriefConcept(concept: Omit<BriefConcept, 'id' | 'created_at' | 'updated_at'>): Promise<BriefConcept> {
  const dbConcept = {
    ...concept,
    id: uuidv4(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    concept_title: concept.concept_title || 'New Concept',
    body_content_structured: concept.body_content_structured || [],
    order_in_batch: concept.order_in_batch || 0
  };

  const { data, error } = await supabase
    .from('brief_concepts')
    .insert(dbConcept)
    .select()
    .single();

  if (error) {
    console.error('Error creating concept:', error);
    throw error;
  }

  // Transform from DB format to app format
  return {
    ...data,
    body_content_structured: data.body_content_structured as unknown as BriefConcept['body_content_structured'],
  };
}

export async function updateBriefConcept(concept: Partial<BriefConcept> & { id: string }): Promise<BriefConcept> {
  const dbConcept = {
    ...concept,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('brief_concepts')
    .update(dbConcept)
    .eq('id', concept.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating concept:', error);
    throw error;
  }

  // Transform from DB format to app format
  return {
    ...data,
    body_content_structured: data.body_content_structured as unknown as BriefConcept['body_content_structured'],
  };
}

export async function deleteBriefConcept(conceptId: string): Promise<void> {
  const { error } = await supabase
    .from('brief_concepts')
    .delete()
    .eq('id', conceptId);

  if (error) {
    console.error('Error deleting concept:', error);
    throw error;
  }
}

// Media Upload Service
export async function uploadMedia(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/${uuidv4()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('powerbrief-media')
    .upload(filePath, file);

  if (error) {
    console.error('Error uploading file:', error);
    throw error;
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('powerbrief-media')
    .getPublicUrl(filePath);

  return publicUrl;
}

/**
 * Share a brief batch with others
 * @param batchId - ID of the brief batch to share
 * @param shareType - Type of sharing (link or email)
 * @param shareSettings - Settings for the share
 * @returns The share result with ID and URL
 */
export async function shareBriefBatch(
  batchId: string,
  shareType: 'link' | 'email',
  shareSettings: ShareSettings
): Promise<ShareResult> {
  const supabase = createSPAClient();
  
  // Generate a unique share ID
  const shareId = crypto.randomUUID();
  
  // Create the share URL based on the share type
  const shareUrl = `${window.location.origin}/public/brief/${shareId}`;
  
  // Update the brief batch with the share settings
  const { data, error } = await supabase
    .from('brief_batches')
    .update({
      share_settings: {
        [shareId]: {
          ...shareSettings,
          created_at: new Date().toISOString(),
          share_type: shareType
        }
      }
    })
    .eq('id', batchId)
    .select();
  
  if (error) {
    console.error('Error sharing brief batch:', error);
    throw new Error(`Failed to share brief batch: ${error.message}`);
  }
  
  // If email sharing, send the email invitation via an API endpoint
  if (shareType === 'email' && shareSettings.email) {
    try {
      await fetch('/api/share/send-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: shareSettings.email,
          shareUrl,
          batchId,
          shareId,
          shareType: 'batch'
        })
      });
    } catch (emailError) {
      console.error('Error sending share invitation email:', emailError);
      // Continue even if email fails - we'll return the share link anyway
    }
  }
  
  return {
    share_id: shareId,
    share_url: shareUrl
  };
}

/**
 * Share a brief concept with others
 * @param conceptId - ID of the brief concept to share
 * @param shareType - Type of sharing (link or email)
 * @param shareSettings - Settings for the share
 * @returns The share result with ID and URL
 */
export async function shareBriefConcept(
  conceptId: string,
  shareType: 'link' | 'email',
  shareSettings: ShareSettings
): Promise<ShareResult> {
  const supabase = createSPAClient();
  
  // Generate a unique share ID
  const shareId = crypto.randomUUID();
  
  // Create the share URL based on the share type
  const shareUrl = `${window.location.origin}/public/concept/${shareId}`;
  
  // Update the brief concept with the share settings
  const { data, error } = await supabase
    .from('brief_concepts')
    .update({
      share_settings: {
        [shareId]: {
          ...shareSettings,
          created_at: new Date().toISOString(),
          share_type: shareType
        }
      }
    })
    .eq('id', conceptId)
    .select();
  
  if (error) {
    console.error('Error sharing brief concept:', error);
    throw new Error(`Failed to share brief concept: ${error.message}`);
  }
  
  // If email sharing, send the email invitation via an API endpoint
  if (shareType === 'email' && shareSettings.email) {
    try {
      await fetch('/api/share/send-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: shareSettings.email,
          shareUrl,
          conceptId,
          shareId,
          shareType: 'concept'
        })
      });
    } catch (emailError) {
      console.error('Error sending share invitation email:', emailError);
      // Continue even if email fails - we'll return the share link anyway
    }
  }
  
  return {
    share_id: shareId,
    share_url: shareUrl
  };
} 