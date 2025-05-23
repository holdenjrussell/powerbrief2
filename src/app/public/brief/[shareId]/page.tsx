"use client";

import React, { useState, useEffect } from 'react';
import { createSPAClient } from '@/lib/supabase/client';
import { Brand, BriefBatch, BriefConcept, Scene } from '@/lib/types/powerbrief';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

// Extended types to match the actual data shape from Supabase
interface ExtendedBriefBatch extends Omit<BriefBatch, 'brand_id'> {
  brands: {
    id: string;
    user_id: string;
    name: string; // This is the brand_name
    brand_info_data: any;
    target_audience_data: any;
    competition_data: any;
    created_at: string;
    updated_at: string;
  };
  share_settings?: Record<string, any>;
}

export default function SharedBriefPage({ params }: { params: { shareId: string } }) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [brand, setBrand] = useState<any>(null);
  const [batch, setBatch] = useState<any>(null);
  const [concepts, setConcepts] = useState<any[]>([]);
  const [isEditable, setIsEditable] = useState<boolean>(false);
  
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params as any) as { shareId: string };
  const { shareId } = unwrappedParams;

  useEffect(() => {
    const fetchSharedBatch = async () => {
      try {
        setLoading(true);
        const supabase = createSPAClient();

        // Find the batch with this shareId in its share_settings
        const { data: batchData, error: batchError } = await supabase
          .from('brief_batches')
          .select('*, brands(*)')
          .contains('share_settings', { [shareId]: {} });

        if (batchError) {
          throw batchError;
        }

        if (!batchData || batchData.length === 0) {
          setError('Shared content not found or has expired');
          setLoading(false);
          return;
        }

        const batchWithShare = batchData[0];
        // Use type assertion to treat the data as having share_settings
        const shareSettings = (batchWithShare as any).share_settings?.[shareId];
        
        if (!shareSettings) {
          setError('Share settings not found');
          setLoading(false);
          return;
        }

        // Check if share has expired
        if (shareSettings.expires_at && new Date(shareSettings.expires_at) < new Date()) {
          setError('This shared link has expired');
          setLoading(false);
          return;
        }

        // Set the editability based on share settings
        setIsEditable(!!shareSettings.is_editable);

        // Get the brand data
        const brandData = batchWithShare.brands;
        if (brandData) {
          setBrand(brandData);
        }

        // Set batch data
        setBatch(batchWithShare);

        // Get concepts for this batch
        const { data: conceptsData, error: conceptsError } = await supabase
          .from('brief_concepts')
          .select('*')
          .eq('brief_batch_id', batchWithShare.id)
          .order('order_in_batch', { ascending: true });

        if (conceptsError) {
          throw conceptsError;
        }

        setConcepts(conceptsData || []);
      } catch (err: any) {
        console.error('Error fetching shared batch:', err);
        setError(err.message || 'Failed to load shared content');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedBatch();
  }, [shareId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert>
          <AlertDescription>{error || 'Content not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{batch.name}</h1>
          <div className="flex items-center space-x-2">
            {isEditable ? (
              <span className="flex items-center text-green-600 text-sm">
                <Eye className="h-4 w-4 mr-1" />
                You can edit this content
              </span>
            ) : (
              <span className="flex items-center text-gray-600 text-sm">
                <EyeOff className="h-4 w-4 mr-1" />
                View only
              </span>
            )}
          </div>
        </div>
        {brand && (
          <p className="text-gray-500">
            Brand: {brand.name}
          </p>
        )}
      </div>

      <Tabs defaultValue="concepts" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="concepts">Concepts ({concepts.length})</TabsTrigger>
          {brand && <TabsTrigger value="brand">Brand Information</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="concepts" className="space-y-6">
          {concepts.length === 0 ? (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No concepts available in this batch.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {concepts.map((concept) => (
                <Card key={concept.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{concept.concept_title}</CardTitle>
                    {concept.status && (
                      <CardDescription>Status: {concept.status}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Media Preview */}
                    {concept.media_url && (
                      <div className="h-[150px] bg-gray-100 rounded flex items-center justify-center">
                        {concept.media_type === 'video' ? (
                          <video
                            src={concept.media_url}
                            controls
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <img
                            src={concept.media_url}
                            alt="Concept media"
                            className="h-full w-full object-contain"
                          />
                        )}
                      </div>
                    )}
                    
                    {/* Caption Hooks */}
                    {concept.caption_hook_options && (
                      <div>
                        <h3 className="font-medium text-sm mb-1">Caption Hook options</h3>
                        <p className="text-sm bg-gray-50 p-3 rounded">
                          {concept.caption_hook_options}
                        </p>
                      </div>
                    )}
                    
                    {/* View full concept link */}
                    <div className="pt-2">
                      <Link
                        href={`/public/concept/${shareId}/${concept.id}`}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View full concept details →
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="brand">
          {brand && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Brand Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Brand Name</h3>
                      <p>{brand.name}</p>
                    </div>
                    
                    {brand.brand_info_data && (
                      <div>
                        <h3 className="font-medium">Brand Information</h3>
                        <div className="space-y-2 mt-2">
                          {typeof brand.brand_info_data === 'object' && brand.brand_info_data !== null ? 
                            Object.entries(brand.brand_info_data).map(([key, value]) => (
                              <div key={key} className="bg-gray-50 p-3 rounded">
                                <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}: </span>
                                <span>{String(value)}</span>
                              </div>
                            )) : 
                            <p className="whitespace-pre-wrap">{String(brand.brand_info_data)}</p>
                          }
                        </div>
                      </div>
                    )}
                    
                    {brand.target_audience_data && (
                      <div>
                        <h3 className="font-medium">Target Audience</h3>
                        <div className="space-y-2 mt-2">
                          {typeof brand.target_audience_data === 'object' && brand.target_audience_data !== null ? 
                            Object.entries(brand.target_audience_data).map(([key, value]) => (
                              <div key={key} className="bg-gray-50 p-3 rounded">
                                <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}: </span>
                                <span>{String(value)}</span>
                              </div>
                            )) : 
                            <p className="whitespace-pre-wrap">{String(brand.target_audience_data)}</p>
                          }
                        </div>
                      </div>
                    )}
                    
                    {brand.competition_data && (
                      <div>
                        <h3 className="font-medium">Competition</h3>
                        <div className="space-y-2 mt-2">
                          {typeof brand.competition_data === 'object' && brand.competition_data !== null ? 
                            Object.entries(brand.competition_data).map(([key, value]) => (
                              <div key={key} className="bg-gray-50 p-3 rounded">
                                <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}: </span>
                                <span>{String(value)}</span>
                              </div>
                            )) : 
                            <p className="whitespace-pre-wrap">{String(brand.competition_data)}</p>
                          }
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 