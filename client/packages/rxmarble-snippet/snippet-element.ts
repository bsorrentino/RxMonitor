
const USE_SHADOW_DOM = true;


/**
 * 
 */
export class RXMarbleCodeSnippetElement extends HTMLElement {

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

        this.shadowRoot.appendChild(this.getTemplate().content.cloneNode(true));

        console.log( 'fetch', this.url + '.ts' )
        
        fetch(this.url + '.ts')
        .then( response =>  {
            if (response.status !== 200) {
              console.log('Looks like there was a problem. Status Code: ', response.status);
              return;
            }
      
            // Examine the text in the response
            response.text().then( text => {
                let code = shadowRoot.querySelector('#snippet') as HTMLElement;
                code.innerText = text;
            });
          }
        )
        .catch(err => console.log('Fetch Error :-S', err ) );        
    }

    private getTemplate() {
        const template = document.createElement('template');
        template.innerHTML = `
        <style>
        #snippet {
            border-style: solid;
            border-width: thin;
            padding-left: 5px;
            font-size: var(--font-size, medium); 
        }
        </style>
        <pre id='snippet'></pre>`
        ;
        
        return template;
    }

}

try {

    customElements.define('rxmarble-snippet', RXMarbleCodeSnippetElement);

} catch (err) {
    console.error( err );
}
