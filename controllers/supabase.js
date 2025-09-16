const supabase = require('../utils/supabaseClient');
const fs = require('fs');
const path = require('path');

const bucketName = 'files';

exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: "No file uploaded" });
        }

        const fileBuffer = req.file.buffer;
        const originalName = req.file.originalname;
        const contentType = req.file.mimetype;
        const fileNameOnSupabase = `jd_${Date.now()}_${originalName}`;

        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(fileNameOnSupabase, fileBuffer, {
                contentType,
                upsert: true,
            });

        if (error) {
            return res.status(500).json({ success: false, error: error.message });
        }

        const { data: publicData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(fileNameOnSupabase);

        return res.status(200).json({
            success: true,
            file: data,
            publicUrl: publicData.publicUrl,
        });

    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};


exports.downloadFile = async (req, res) => {

    try {
        
        const {filename} = req.params;
        console.log('Request params:', req.params);
        if(!filename) return res.status(400).json({ error: 'filename is required' });

        const { data, error } = await supabase.storage.from(bucketName).download(filename);
        if(error) return res.status(500).json({ error: error.message });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return data.pipe(res);
    } catch(err) {
        return res.status(500).json({ error: err.message })
    }
}

exports.deleteFile = async (req, res) => {

    try {
        const { filename } = req.params;
        if(!filename) return res.status(400).json({ error: 'Filename is required' });

        const {data, error} = await supabase.storage.from(bucketName).remove([filename]);
        if(error) return res.status(500).json({ error: error.message });

        return res.status(200).json({ success: true, message: "File deleted", data });
    } catch(err) {
        return res.status(500).json({ error: err.message });
    }
}

exports.listFiles = async (req, res) => {

    const {data, error} = await supabase.storage.from('files').list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc'}
    });

    if(error) return res.status(500).json({ error: error.message });
    res.json({ files: data });
}