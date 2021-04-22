class DocumentService {
    async getResource(url) {
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error(`Could not fetch ${url}, status ${res.status}`);
        }

        return await res.json();;
    };


    async getDocuments(url){
        const docs = await this.getResource(url);
        return docs.map(this._transformDocument);
    }

    _transformDocument(docs) {
        return {
            uid: docs.uid,
            author: docs.author,
            title: docs.title,
            body: docs.body,
            status: docs.status
        }
    }
}

export default DocumentService;