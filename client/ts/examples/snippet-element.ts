
const USE_SHADOW_DOM = true;

/**
 * 
 */
class RXMarbleCodeSnippetElement extends HTMLElement {

    get url() {
        return this.getAttribute('URL') ;
    }

    set url( v:string ) {
       this.setAttribute('URL', String(v) );
    }

    connectedCallback () {
        const shadowRoot = (USE_SHADOW_DOM) ? 
            this.attachShadow({mode: 'open'}) :
            document;

        if( USE_SHADOW_DOM ) shadowRoot.appendChild( this.getStyle() );

        fetch(this.url)
        .then( response =>  {
            if (response.status !== 200) {
              console.log('Looks like there was a problem. Status Code: ', response.status);
              return;
            }
      
            // Examine the text in the response
            response.text().then( text => {
                let code = shadowRoot.ownerDocument.createElement('div') as HTMLElement;
                code.id = 'snippet';
                code.innerText = text;
                shadowRoot.appendChild( code );
            });
          }
        )
        .catch(err => console.log('Fetch Error :-S', err ) );        
    }

    private getStyle() {
        const styleTag = document.createElement('style')
        styleTag.innerHTML = 
        `
        #snippet {
            border-style: solid;
            border-width: thin;
            padding-left: 5px;
            font-size: small; 
        }
        `;
        
        return styleTag;
     
    }

}

try {

    customElements.define('rxmarble-snippet', RXMarbleCodeSnippetElement);

} catch (err) {
    console.error( err );
}
