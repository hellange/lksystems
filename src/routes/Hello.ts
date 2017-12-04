import { Router} from 'express';

export class Hello {
    router: Router

    /**
     * Initialize
     */
    constructor() {
        this.router = Router();


        this.router.get('/', function (req, res) {
            res.render(
                'index',
                { message1: 'Hello', message2: 'World'})
        });

    }

}

const helloRoutes = new Hello();
export default helloRoutes.router;
